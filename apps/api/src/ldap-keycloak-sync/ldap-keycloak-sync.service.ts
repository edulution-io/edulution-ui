/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Interval, Timeout } from '@nestjs/schedule';
import { Client, SearchOptions } from 'ldapts';
import {
  ALL_GROUPS_CACHE_KEY,
  ALL_USERS_CACHE_KEY,
  DEPLOYMENT_TARGET_CACHE_KEY,
  GROUP_WITH_MEMBERS_CACHE_KEY,
} from '@libs/groups/constants/cacheKeys';
import SPECIAL_SCHOOLS from '@libs/common/constants/specialSchools';
import tls from 'node:tls';
import { Group } from '@libs/groups/types/group';
import LdapConfig from '@libs/ldapKeycloakSync/types/ldapConfig';
import LDAP_SYNC_INTERVAL_MS from '@libs/ldapKeycloakSync/constants/ldapSyncIntervalMs';
import LDAPS_PREFIX from '@libs/ldapKeycloakSync/constants/ldapsPrefix';
import { HttpMethods } from '@libs/common/types/http-methods';
import GroupWithMembers from '@libs/groups/types/groupWithMembers';
import GroupMemberDto from '@libs/groups/types/groupMember.dto';
import LDAP_ATTRIBUTE from '@libs/ldapKeycloakSync/constants/ldapAttribute';
import LDAP_MEMBER_TYPES from '@libs/ldapKeycloakSync/constants/ldapMemberTypes';
import LdapMemberType from '@libs/ldapKeycloakSync/types/ldapMemberType';
import keycloakUserStorageProvider from '@libs/ldapKeycloakSync/constants/keycloakUserStorageProvider';
import { KEYCLOAK_STARTUP_TIMEOUT_MS } from '@libs/ldapKeycloakSync/constants/keycloakSyncValues';
import { InjectModel } from '@nestjs/mongoose';
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import { Model } from 'mongoose';
import { MinimalUser } from '@libs/ldapKeycloakSync/types/minimal.user';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import GROUPS_CACHE_REFRESH_EVENT from '@libs/groups/constants/groupsCacheRefreshEvent';
import sleep from '@libs/common/utils/sleep';
import DeploymentTarget from '@libs/common/types/deployment-target';
import {
  cnToKeycloakCandidates,
  dedupeAddRemove,
  extractCn,
  extractDn,
  missKeyBase,
  missKeyExact,
  parseGroupDn,
  probeCandidatesWithNegativeCache,
  usernameMatchesBaseOrNumbered,
} from '@libs/ldapKeycloakSync/utils/ldap-utils';
import { latinize } from '@libs/common/utils/string/latinize';
import { LDAPUser } from '@libs/groups/types/ldapUser';
import CachedUser from '@libs/user/types/cachedUser';
import {
  GROUPS_CACHE_INITIALIZED_EVENT,
  USERS_CACHE_INITIALIZED_EVENT,
} from '@libs/groups/constants/cacheInitializedEvents';
import { LdapKeycloakSync, LdapKeycloakSyncDocument } from './ldap-keycloak-sync.schema';
import GlobalSettingsService from '../global-settings/global-settings.service';
import KeycloakRequestQueue from '../groups/queue/keycloak-request.queue';
import GroupsService from '../groups/groups.service';

@Injectable()
class LdapKeycloakSyncService implements OnModuleInit {
  private ldapConfig?: LdapConfig;

  private isSyncRunning = false;

  private userCache = new Map<string, GroupMemberDto>();

  private groupCache = new Map<string, Group>();

  private deploymentTarget: DeploymentTarget | '' = '';

  private notFoundUserKeys = new Set<string>();

  private groupsCacheReady = false;

  private usersCacheReady = false;

  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly globalSettingsService: GlobalSettingsService,
    @InjectModel(LdapKeycloakSync.name) private ldapKeycloakSyncModel: Model<LdapKeycloakSyncDocument>,
    private readonly keycloakQueue: KeycloakRequestQueue,
    private readonly eventEmitter: EventEmitter2,
    private readonly groupsService: GroupsService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  onModuleInit() {
    Logger.log('Initialized, waiting for Keycloak startup', LdapKeycloakSyncService.name);
  }

  @Timeout(KEYCLOAK_STARTUP_TIMEOUT_MS)
  async init() {
    await this.loadLdapConfig();
  }

  @OnEvent(GROUPS_CACHE_INITIALIZED_EVENT)
  handleGroupsCacheInitialized() {
    this.groupsCacheReady = true;
    Logger.debug('Groups cache ready signal received', LdapKeycloakSyncService.name);
  }

  @OnEvent(USERS_CACHE_INITIALIZED_EVENT)
  handleUsersCacheInitialized() {
    this.usersCacheReady = true;
    Logger.debug('Users cache ready signal received', LdapKeycloakSyncService.name);
  }

  @Interval(LDAP_SYNC_INTERVAL_MS)
  async sync() {
    if (!this.ldapConfig) {
      Logger.error('No LDAP config, sync canceled', LdapKeycloakSyncService.name);
      return;
    }

    if (!this.groupsCacheReady || !this.usersCacheReady) {
      Logger.debug(
        `Waiting for caches to initialize (groups: ${this.groupsCacheReady}, users: ${this.usersCacheReady}) — skipping sync`,
        LdapKeycloakSyncService.name,
      );
      return;
    }

    if (this.isSyncRunning) {
      Logger.debug('Sync already running — skipping this run', LdapKeycloakSyncService.name);
      return;
    }

    if (!(await this.getDeploymentTarget())) {
      Logger.error('Sync canceled, deployment target missing.', LdapKeycloakSyncService.name);
      return;
    }

    this.isSyncRunning = true;
    try {
      Logger.debug('Full group sync started', LdapKeycloakSyncService.name);

      this.notFoundUserKeys.clear();

      const client = await this.setupClient();

      const ldapEntries = await this.searchAllGroups(client);
      const ldapDns = new Set(ldapEntries.map((e) => extractDn(e.distinguishedName)));

      const cachedGroupsFlat = (await this.cache.get<Group[]>(ALL_GROUPS_CACHE_KEY + SPECIAL_SCHOOLS.GLOBAL)) || [];
      if (!cachedGroupsFlat.length) {
        return;
      }

      const groupsByName = new Map<string, Group>();
      const groupsByPath = new Map<string, Group>();
      cachedGroupsFlat.forEach((group) => {
        groupsByName.set(group.name, group);
        if (group.path) groupsByPath.set(group.path, group);
      });
      this.groupCache = groupsByName;

      const usernameToUserFromCache = await this.buildUsernameMapFromCache(cachedGroupsFlat);

      const pendingAdds = new Map<string, Set<string>>();
      const updates: Array<{ userId: string; add: string[]; remove: string[] }> = [];

      const adminGroups = await this.globalSettingsService.getAdminGroupsFromCache();
      const adminGroupNames = adminGroups.map((group) => group.substring(1));

      await Promise.all(
        Array.from(ldapDns).map(async (dn) => {
          const { groupPath } = parseGroupDn(dn);
          const existingGroup = await this.ensureKeycloakGroupUsingCache(groupPath, groupsByPath);

          const desiredRaw = await this.fetchMembers(client, dn, groupsByName);

          const desiredUsernames = new Set<string>();

          const resolvedList = await Promise.all(desiredRaw.map((n) => this.cnToKeycloakUsernameIfNeeded(n)));

          resolvedList.filter((u): u is string => Boolean(u)).forEach((u) => desiredUsernames.add(u));

          const rawMembers = await this.getCachedGroupMembers(groupPath);

          const invalid = rawMembers.filter((m) => !m || !m.id || !m.username);
          if (invalid.length) {
            Logger.warn(
              `Group ${groupPath} has ${invalid.length} cached member(s) without id/username`,
              LdapKeycloakSyncService.name,
            );
          }

          const currentMembers = rawMembers.filter((m): m is GroupMemberDto => Boolean(m && m.id && m.username));

          const currentUsernames = new Set(currentMembers.map((m) => m.username));

          Logger.verbose(
            `Group ${groupPath}: desired=${Array.from(desiredUsernames).join(',')} current=${Array.from(currentUsernames).join(',')}`,
            LdapKeycloakSyncService.name,
          );

          desiredUsernames.forEach((desiredUsername) => {
            if (!currentUsernames.has(desiredUsername)) {
              const found = usernameToUserFromCache.get(desiredUsername);
              if (found) {
                updates.push({ userId: found.id, add: [existingGroup.id], remove: [] });
                Logger.debug(
                  `Will ADD user ${desiredUsername} -> group ${existingGroup.path}`,
                  LdapKeycloakSyncService.name,
                );
              } else {
                const desiredUsernameSet = pendingAdds.get(desiredUsername) || new Set<string>();
                desiredUsernameSet.add(existingGroup.id);
                pendingAdds.set(desiredUsername, desiredUsernameSet);
              }
            }
          });

          currentMembers.forEach((member) => {
            if (!desiredUsernames.has(member.username)) {
              updates.push({ userId: member.id, add: [], remove: [existingGroup.id] });
              const nameForLog = member?.username ?? `(id:${member?.id ?? 'unknown'})`;
              Logger.debug(
                `Will REMOVE user ${nameForLog} -> group ${existingGroup.path}`,
                LdapKeycloakSyncService.name,
              );
            }
          });
        }),
      );

      Logger.verbose(`Built ${updates.length} raw updates`, LdapKeycloakSyncService.name);

      if (pendingAdds.size) {
        const cachedUsers = await this.cache.get<CachedUser[]>(ALL_USERS_CACHE_KEY + SPECIAL_SCHOOLS.GLOBAL);
        const resolvedUsers = cachedUsers || [];

        const usersMap = new Map<string, MinimalUser>();

        resolvedUsers.forEach((u) => {
          if (u.username && u.id && !usersMap.has(u.username)) {
            usersMap.set(u.username, { id: u.id, username: u.username });
          }
        });

        pendingAdds.forEach((groupIds, username) => {
          const user = usersMap.get(username);
          if (user) {
            updates.push({ userId: user.id, add: Array.from(groupIds), remove: [] });
          } else {
            Logger.verbose(`-> Username not found in Keycloak: ${username}`, LdapKeycloakSyncService.name);
          }
        });
      }

      await this.applyUpdatesDeduped(updates);

      const ldapPaths = new Set(Array.from(ldapDns).map((dn) => parseGroupDn(dn).groupPath));
      const cachedPaths = new Set(Array.from(groupsByPath.keys()));
      const toDeletePaths = Array.from(cachedPaths).filter((p) => !ldapPaths.has(p));

      if (toDeletePaths.length) {
        toDeletePaths.sort((a, b) => b.length - a.length);

        await Promise.all(
          toDeletePaths.map((path) => {
            const group = groupsByPath.get(path);
            if (!group) {
              return Promise.resolve();
            }

            if (adminGroupNames.includes(group.name)) {
              return Promise.resolve();
            }

            return this.groupsService.deleteGroup(group.id);
          }),
        );
      }

      this.eventEmitter.emit(GROUPS_CACHE_REFRESH_EVENT);

      await this.persistLastSync();

      await client.unbind();

      Logger.debug('Sync complete', LdapKeycloakSyncService.name);
    } catch (e) {
      Logger.error(`Sync failed: ${(e as Error).message}`, LdapKeycloakSyncService.name);
    } finally {
      this.isSyncRunning = false;
    }
  }

  public async updateGroupMembershipByNames(
    targetGroupName: string,
    addUsernames: string[] = [],
    removeUsernames: string[] = [],
    addGroupNames: string[] = [],
    removeGroupNames: string[] = [],
  ): Promise<void> {
    const groupPath = targetGroupName.startsWith('/') ? targetGroupName : `/${targetGroupName}`;
    const targetGroup = await this.ensureKeycloakGroupUsingCache(groupPath);

    const expandGroupsToUsers = async (names: string[]) => {
      const users: GroupMemberDto[] = [];
      await Promise.all(
        names.map(async (name) => {
          const type = await this.resolveLdapMember(name);
          if (type === LDAP_MEMBER_TYPES.USER) {
            users.push(this.userCache.get(name)!);
            return;
          }
          const expanded = await this.expandGroupNameToUsers(name);
          users.push(...expanded);
        }),
      );
      return users;
    };

    const addDirectUsers = await expandGroupsToUsers(addUsernames);
    const removeDirectUsers = await expandGroupsToUsers(removeUsernames);
    const addFromGroups = await expandGroupsToUsers(addGroupNames);
    const removeFromGroups = await expandGroupsToUsers(removeGroupNames);

    const toAddIds = [...addDirectUsers, ...addFromGroups].map((u) => u.id);
    const toRemoveIds = [...removeDirectUsers, ...removeFromGroups].map((u) => u.id);

    const addSet = new Set(toAddIds);
    const removeSet = new Set(toRemoveIds);

    await Promise.all(Array.from(addSet).map((userId) => this.updateUserGroups(userId, [targetGroup.id], [])));
    await Promise.all(Array.from(removeSet).map((userId) => this.updateUserGroups(userId, [], [targetGroup.id])));

    this.eventEmitter.emit(GROUPS_CACHE_REFRESH_EVENT);
  }

  public async reconcileNamedGroupMembers(
    targetGroupName: string,
    desiredUsernames: string[] = [],
    desiredGroupNames: string[] = [],
  ): Promise<void> {
    const groupPath = targetGroupName.startsWith('/') ? targetGroupName : `/${targetGroupName}`;
    const targetGroup = await this.ensureKeycloakGroupUsingCache(groupPath);

    const expandedGroupUsers = (await Promise.all(desiredGroupNames.map((name) => this.expandGroupNameToUsers(name))))
      .flat()
      .map((member) => member.username);

    const allDesiredUsernames = new Set([...desiredUsernames, ...expandedGroupUsers]);

    const desiredUsers = await Promise.all(
      Array.from(allDesiredUsernames).map(async (name) => {
        const type = await this.resolveLdapMember(name);

        return type === LDAP_MEMBER_TYPES.USER ? this.userCache.get(name) : undefined;
      }),
    );

    const desiredIds = new Set(
      desiredUsers.filter((member): member is GroupMemberDto => Boolean(member)).map((member) => member.id),
    );

    const currentMembers = await this.getCachedGroupMembers(groupPath);
    const currentIds = new Set(currentMembers.map((member) => member.id));

    const toAdd = Array.from(desiredIds).filter((id) => !currentIds.has(id));
    const toRemove = Array.from(currentIds).filter((id) => !desiredIds.has(id));

    await Promise.all(toAdd.map((id) => this.updateUserGroups(id, [targetGroup.id], [])));
    await Promise.all(toRemove.map((id) => this.updateUserGroups(id, [], [targetGroup.id])));

    this.eventEmitter.emit(GROUPS_CACHE_REFRESH_EVENT);
  }

  private async expandGroupNameToUsers(name: string): Promise<GroupMemberDto[]> {
    const allGroups = (await this.cache.get<Group[]>(ALL_GROUPS_CACHE_KEY + SPECIAL_SCHOOLS.GLOBAL)) || [];

    const root = allGroups.find((g) => g.name === name || g.path === `/${name}`);

    if (root) {
      const collectIds = (group: Group): string[] => [
        group.id,
        ...(group.subGroups || []).flatMap((sg) => collectIds(sg)),
      ];

      const ids = collectIds(root);

      const results = await Promise.all(
        allGroups
          .filter((group) => ids.includes(group.id))
          .map(async (group) => {
            const groupWithMembers = await this.cache.get<GroupWithMembers>(
              `${GROUP_WITH_MEMBERS_CACHE_KEY}-${group.path}`,
            );

            return groupWithMembers?.members || [];
          }),
      );

      return results.flat();
    }

    const type = await this.resolveLdapMember(name);
    if (type === LDAP_MEMBER_TYPES.GROUP) {
      const subgroup = this.groupCache.get(name)!;

      const groupWithMembers = await this.cache.get<GroupWithMembers>(
        `${GROUP_WITH_MEMBERS_CACHE_KEY}-${subgroup.path}`,
      );

      return groupWithMembers?.members || [];
    }

    return [];
  }

  private async persistLastSync() {
    await this.ldapKeycloakSyncModel.updateOne({}, { lastSync: new Date() }, { upsert: true });
  }

  private async loadLdapConfig() {
    const configs = await this.keycloakQueue.enqueue<LdapConfig[]>(HttpMethods.GET, '/components');

    this.ldapConfig = configs.find((c) => c.providerType === keycloakUserStorageProvider);

    Logger.verbose(`Loaded LDAP config ${this.ldapConfig?.id}`, LdapKeycloakSyncService.name);
  }

  private async getBindCredentials() {
    const ldapConfig = await this.globalSettingsService.getGlobalSettings('general.ldap');

    const bindDN = ldapConfig?.general?.ldap?.binduser?.dn;
    const bindCredentials = ldapConfig?.general?.ldap?.binduser?.password;
    if (!bindDN || !bindCredentials) throw new Error('Missing LDAP bind credentials');

    return { bindDN, bindCredentials };
  }

  private async setupClient(): Promise<Client> {
    const { bindDN, bindCredentials } = await this.getBindCredentials();
    const url = process.env.LDAP_TUNNEL_URL || this.ldapConfig!.config.connectionUrl[0];

    const useLdaps = url.startsWith(LDAPS_PREFIX);
    const configuredStartTls = this.ldapConfig!.config.startTls?.[0] === 'true';
    const useStartTls = !useLdaps && configuredStartTls;

    const hostForTls = (() => {
      try {
        return new URL(url.replace('ldaps://', 'https://').replace('ldap://', 'http://')).hostname;
      } catch {
        return undefined;
      }
    })();

    const tlsOptions: tls.ConnectionOptions = {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
      servername: hostForTls,
    };

    const ldapClient = new Client({
      url,
      timeout: 15_000,
      connectTimeout: 10_000,
      tlsOptions: useLdaps ? tlsOptions : undefined,
    });

    try {
      if (useStartTls) {
        await ldapClient.startTLS(tlsOptions);
      } else if (useLdaps && configuredStartTls) {
        Logger.warn('LDAP uses ldaps://; STARTTLS setting will be ignored.', LdapKeycloakSyncService.name);
      }

      const tryBind = async (attempt = 0): Promise<void> => {
        try {
          await ldapClient.bind(bindDN, bindCredentials);
          return undefined;
        } catch (bindError) {
          const msg = (bindError as Error)?.message || '';
          const retriable = /ECONNRESET|ETIMEDOUT|socket hang up|closed before message/i.test(msg);
          if (!retriable || attempt >= 2) {
            throw bindError;
          }
          await sleep(400 + attempt * 400);
          return tryBind(attempt + 1);
        }
      };

      await tryBind();
      return ldapClient;
    } catch (error) {
      try {
        await ldapClient.unbind();
      } catch (unbindError) {
        Logger.debug(`LDAP unbind failed: ${(unbindError as Error).message}`, LdapKeycloakSyncService.name);
      }
      throw error;
    }
  }

  private async searchAllGroups(ldapClient: Client) {
    const base = this.ldapConfig!.config.usersDn[0];

    const filter = '(objectClass=group)';

    const ldapSearchOptions: SearchOptions = { scope: 'sub', filter, attributes: [LDAP_ATTRIBUTE.DN] };

    if ((await this.getDeploymentTarget()) === DEPLOYMENT_TARGET.LINUXMUSTER) {
      const bases = [`OU=SCHOOLS,${base}`, `OU=GLOBAL,${base}`];

      const results = await Promise.all(
        bases.map(async (b) => {
          const { searchEntries } = await ldapClient.search(b, ldapSearchOptions);

          Logger.verbose(`Found ${searchEntries.length} LDAP groups under ${b}`, LdapKeycloakSyncService.name);
          return searchEntries;
        }),
      );

      const all = results.flat();
      Logger.verbose(`Total ${all.length} LDAP groups (combined scan)`, LdapKeycloakSyncService.name);
      return all;
    }

    const { searchEntries } = await ldapClient.search(base, ldapSearchOptions);
    Logger.verbose(`Found ${searchEntries.length} LDAP groups under ${base}`, LdapKeycloakSyncService.name);
    return searchEntries;
  }

  private async buildUsernameMapFromCache(groups: Group[]): Promise<Map<string, MinimalUser>> {
    const userMap = new Map<string, MinimalUser>();

    const groupMembers = await Promise.all(
      groups.map(async (group) => {
        const key = `${GROUP_WITH_MEMBERS_CACHE_KEY}-${group.path}`;

        const groupWithMembers = await this.cache.get<GroupWithMembers>(key);

        return groupWithMembers?.members || [];
      }),
    );

    groupMembers.flat().forEach((member) => {
      if (member.username && member.id && !userMap.has(member.username)) {
        userMap.set(member.username, { id: member.id, username: member.username });
      }
    });

    return userMap;
  }

  private async getCachedGroupMembers(groupPath: string): Promise<GroupMemberDto[]> {
    const groupWithMembers = await this.cache.get<GroupWithMembers>(`${GROUP_WITH_MEMBERS_CACHE_KEY}-${groupPath}`);
    return groupWithMembers?.members || [];
  }

  private async ensureKeycloakGroupUsingCache(
    groupPath: string,
    groupsByPath?: Map<string, Group>,
  ): Promise<GroupWithMembers> {
    let group: Group | undefined = groupsByPath ? groupsByPath.get(groupPath) : undefined;

    if (!group) {
      const allGroups = (await this.cache.get<Group[]>(ALL_GROUPS_CACHE_KEY + SPECIAL_SCHOOLS.GLOBAL)) || [];

      group = allGroups.find((g) => g.path === groupPath);
    }

    if (!group) {
      const name = groupPath.slice(1);

      await this.groupsService.createGroup(name);

      this.eventEmitter.emit(GROUPS_CACHE_REFRESH_EVENT);

      const fetchOnce = async () => {
        const found = await this.groupsService.searchGroupsByName(name);
        return (found || []).find((g) => g.path === groupPath);
      };

      group = await fetchOnce();
      if (!group) {
        await sleep(200);
        group = await fetchOnce();
      }

      if (group) {
        groupsByPath?.set(groupPath, group);
        this.groupCache.set(group.name, group);
      }

      if (!group) {
        throw new Error(`Group ${groupPath} could not be found after creation.`);
      }
    }

    return { ...group, members: [] };
  }

  private async fetchMembers(
    client: Client,
    dn: string,
    groupsByName: Map<string, Group>,
    visited = new Set<string>(),
  ): Promise<string[]> {
    if (visited.has(dn)) return [];

    visited.add(dn);

    const opts: SearchOptions = { scope: 'base', filter: '(objectClass=group)', attributes: [LDAP_ATTRIBUTE.MEMBER] };
    const { searchEntries } = await client.search(dn, opts);

    if (!searchEntries.length) return [];

    const { member } = searchEntries[0];
    let raw: (string | Buffer<ArrayBufferLike>)[];

    if (Array.isArray(member)) raw = member;
    else if (member) raw = [member];
    else raw = [];

    const names = await Promise.all(
      raw.map(async (rawDn) => {
        const dnString = typeof rawDn === 'string' ? rawDn : rawDn.toString();

        const cn = extractCn(dnString);
        if (!cn) return null;
        const isGroup = groupsByName.has(cn);
        if (isGroup) {
          return (await this.fetchMembers(client, dnString, groupsByName, visited)).filter(Boolean);
        }
        return cn;
      }),
    );

    return names.flat().filter((n): n is string => !!n);
  }

  private async resolveLdapMember(name: string): Promise<LdapMemberType> {
    if (this.userCache.has(name)) return LDAP_MEMBER_TYPES.USER;
    if (this.groupCache.has(name)) return LDAP_MEMBER_TYPES.GROUP;

    const tryExact = async (username: string) => {
      const key = missKeyExact(username);
      if (this.notFoundUserKeys.has(key)) return undefined;

      const users = await this.groupsService.searchUsersByUsername(username, true);
      if (users?.length) {
        const u = LdapKeycloakSyncService.convertToGroupMemberDto(users[0]);
        this.userCache.set(name, u);
        this.userCache.set(u.username, u);
        return u;
      }
      this.notFoundUserKeys.add(key);
      return undefined;
    };

    let user: GroupMemberDto | undefined = await tryExact(name);

    const deploymentTarget = await this.getDeploymentTarget();
    if (!user && deploymentTarget !== DEPLOYMENT_TARGET.LINUXMUSTER) {
      const bases = cnToKeycloakCandidates(name);
      const hit = await probeCandidatesWithNegativeCache<GroupMemberDto>(
        bases,
        this.notFoundUserKeys,
        missKeyBase,
        (base) => this.findUserByBaseOrNumbered(base),
      );
      if (hit) {
        user = hit;
        this.userCache.set(name, user);
        this.userCache.set(user.username, user);
      }
    }

    if (!user && /\s/.test(name)) {
      const plain = latinize(name, { umlauts: true }).trim().replace(/\s+/g, ' ');
      const parts = plain.split(' ');
      const first = parts[0]?.toLowerCase();
      const last = parts[parts.length - 1]?.toLowerCase();

      if (first && last) {
        const results = await this.groupsService.searchUsersByUsername(plain, false);
        const candidates = (results || []).filter((u) => {
          const fPlain = latinize(u.firstName ? String(u.firstName) : '', { umlauts: true, toLower: true });
          const lPlain = latinize(u.lastName ? String(u.lastName) : '', { umlauts: true, toLower: true });
          return fPlain === first && lPlain === last;
        });

        if (candidates.length) {
          const [first1] = candidates;
          user = LdapKeycloakSyncService.convertToGroupMemberDto(first1);
          if (candidates.length > 1) {
            Logger.warn(
              `Multiple Keycloak users match "${plain}" (first+last). Using id=${user.id}.`,
              LdapKeycloakSyncService.name,
            );
          }
        }
      }
    }

    if (user) {
      this.userCache.set(name, user);
      this.userCache.set(user.username, user);
      return LDAP_MEMBER_TYPES.USER;
    }

    const groups = await this.groupsService.searchGroupsByName(name);
    const match = groups.find((g) => g.name === name);
    if (match) {
      this.groupCache.set(name, match);
      return LDAP_MEMBER_TYPES.GROUP;
    }

    return LDAP_MEMBER_TYPES.MISSING;
  }

  private async applyUpdatesDeduped(updates: Array<{ userId: string; add: string[]; remove: string[] }>) {
    const byUser = new Map<string, { add: Set<string>; remove: Set<string> }>();

    updates.forEach((u) => {
      const entry = byUser.get(u.userId) || { add: new Set<string>(), remove: new Set<string>() };
      u.add.forEach((g) => entry.add.add(g));
      u.remove.forEach((g) => entry.remove.add(g));
      byUser.set(u.userId, entry);
    });

    await Promise.all(
      Array.from(byUser.entries()).map(async ([userId, { add, remove }]) => {
        dedupeAddRemove(add, remove);
        if (add.size || remove.size) {
          Logger.verbose(
            `Applying updates for user=${userId}: add=[${Array.from(add).join(',')}] remove=[${Array.from(remove).join(',')}]`,
            LdapKeycloakSyncService.name,
          );
          await this.updateUserGroups(userId, Array.from(add), Array.from(remove));
        }
      }),
    );
  }

  private async updateUserGroups(userId: string, toAddIds: string[], toRemoveIds: string[]) {
    try {
      if (toAddIds.length > 0) {
        await this.groupsService.addUserToGroups(userId, toAddIds);
      }
      if (toRemoveIds.length > 0) {
        await this.groupsService.removeUserFromGroups(userId, toRemoveIds);
      }
    } catch (error) {
      Logger.error(`Failed to update ${userId}`, (error as Error).stack, LdapKeycloakSyncService.name);
    }
  }

  private async cnToKeycloakUsernameIfNeeded(nameFromLdap: string): Promise<string | null> {
    const cached = this.userCache.get(nameFromLdap);
    if (cached?.username) return cached.username;

    const deploymentTarget = await this.getDeploymentTarget();
    if (deploymentTarget === DEPLOYMENT_TARGET.LINUXMUSTER) return nameFromLdap;

    const cnMiss = missKeyExact(nameFromLdap);
    if (this.notFoundUserKeys.has(cnMiss)) return null;

    const bases = cnToKeycloakCandidates(nameFromLdap);
    const hit = await probeCandidatesWithNegativeCache<GroupMemberDto>(
      bases,
      this.notFoundUserKeys,
      missKeyBase,
      (base) => this.findUserByBaseOrNumbered(base),
    );

    if (hit) {
      this.userCache.set(nameFromLdap, hit);
      this.userCache.set(hit.username, hit);
      return hit.username;
    }

    this.notFoundUserKeys.add(cnMiss);
    return null;
  }

  private async findUserByBaseOrNumbered(base: string): Promise<GroupMemberDto | undefined> {
    const baseKey = missKeyBase(base);
    if (this.notFoundUserKeys.has(baseKey)) return undefined;

    const exact = await this.groupsService.searchUsersByUsername(base, true);
    if (exact?.length) return LdapKeycloakSyncService.convertToGroupMemberDto(exact[0]);

    const results = await this.groupsService.searchUsersByUsername(base, false);

    const match = (results || []).find((u) => u?.username && usernameMatchesBaseOrNumbered(u.username, base));
    if (!match) {
      this.notFoundUserKeys.add(baseKey);
      return undefined;
    }
    return LdapKeycloakSyncService.convertToGroupMemberDto(match);
  }

  private async getDeploymentTarget(): Promise<DeploymentTarget> {
    if (!this.deploymentTarget) {
      this.deploymentTarget =
        (await this.cache.get<DeploymentTarget>(DEPLOYMENT_TARGET_CACHE_KEY)) ?? DEPLOYMENT_TARGET.LINUXMUSTER;
    }
    return this.deploymentTarget;
  }

  private static convertToGroupMemberDto(user: LDAPUser): GroupMemberDto {
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  }
}

export default LdapKeycloakSyncService;
