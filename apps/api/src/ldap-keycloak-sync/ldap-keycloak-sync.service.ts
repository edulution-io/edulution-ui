/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Interval, Timeout } from '@nestjs/schedule';
import { Client, SearchOptions } from 'ldapts';
import {
  ALL_GROUPS_CACHE_KEY,
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
import { EventEmitter2 } from '@nestjs/event-emitter';
import GROUPS_CACHE_REFRESH_EVENT from '@libs/groups/constants/groupsCacheRefreshEvent';
import sleep from '@libs/common/utils/sleep';
import DeploymentTarget from '@libs/common/types/deployment-target';
import { LdapKeycloakSync, LdapKeycloakSyncDocument } from './ldap-keycloak-sync.schema';
import GlobalSettingsService from '../global-settings/global-settings.service';
import KeycloakRequestQueue from './queue/keycloak-request.queue';

@Injectable()
class LdapKeycloakSyncService implements OnModuleInit {
  private ldapConfig?: LdapConfig;

  private isSyncRunning = false;

  private userCache = new Map<string, GroupMemberDto>();

  private groupCache = new Map<string, Group>();

  private deploymentTarget: DeploymentTarget | '' = '';

  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly globalSettingsService: GlobalSettingsService,
    @InjectModel(LdapKeycloakSync.name) private ldapKeycloakSyncModel: Model<LdapKeycloakSyncDocument>,
    private readonly keycloakQueue: KeycloakRequestQueue,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  onModuleInit() {
    Logger.log('Initialized, waiting for Keycloak startup', LdapKeycloakSyncService.name);
  }

  @Timeout(KEYCLOAK_STARTUP_TIMEOUT_MS)
  async init() {
    await this.loadLdapConfig();
  }

  @Interval(LDAP_SYNC_INTERVAL_MS)
  async sync() {
    if (!this.ldapConfig) {
      Logger.error('No LDAP config, sync canceled', LdapKeycloakSyncService.name);
      return;
    }

    if (this.isSyncRunning) {
      Logger.debug('Sync already running — skipping this run', LdapKeycloakSyncService.name);
      return;
    }

    const deploymentTarget = await this.cache.get<DeploymentTarget>(DEPLOYMENT_TARGET_CACHE_KEY);
    if (!deploymentTarget) {
      Logger.error('Sync canceled, deployment target missing.', LdapKeycloakSyncService.name);
      return;
    }
    this.deploymentTarget = deploymentTarget;

    this.isSyncRunning = true;
    try {
      Logger.debug(`Full group sync started ${deploymentTarget}`, LdapKeycloakSyncService.name);

      const client = await this.setupClient();

      const ldapEntries = await this.searchAllGroups(client);
      const ldapDns = new Set(ldapEntries.map((e) => LdapKeycloakSyncService.extractDn(e.distinguishedName)));

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

      // TODO: https://github.com/edulution-io/edulution-ui/issues/1010 Get group from DB
      const localAdminGroup = 'role-globaladministrator';

      await Promise.all(
        Array.from(ldapDns).map(async (dn) => {
          const { groupPath } = LdapKeycloakSyncService.parseGroupDn(dn);
          const existingGroup = await this.ensureKeycloakGroupUsingCache(groupPath, groupsByPath);

          const desiredRaw = await this.fetchMembers(client, dn, groupsByName);
          const desiredUsernames = new Set(desiredRaw.map((n) => this.toKeycloakUsernameIfNeeded(n)));

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
        const resolvedUsers = await this.keycloakQueue.fetchAllPaginated<MinimalUser>('/users', '');

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
            Logger.debug(`-> Username not found in Keycloak: ${username}`, LdapKeycloakSyncService.name);
          }
        });
      }

      await this.applyUpdatesDeduped(updates);

      const ldapPaths = new Set(Array.from(ldapDns).map((dn) => LdapKeycloakSyncService.parseGroupDn(dn).groupPath));
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

            if (group.name === localAdminGroup) {
              return Promise.resolve();
            }

            return this.keycloakQueue.enqueue(HttpMethods.DELETE, `/groups/${group.id}`);
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

      await this.keycloakQueue.enqueue(HttpMethods.POST, '/groups', { name });

      this.eventEmitter.emit(GROUPS_CACHE_REFRESH_EVENT);

      const search = encodeURIComponent(name);

      const fetchOnce = async () => {
        const found = await this.keycloakQueue.enqueue<Group[]>(HttpMethods.GET, `/groups?search=${search}`);
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

        const cn = LdapKeycloakSyncService.extractCn(dnString);
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
      const users = await this.keycloakQueue.enqueue<GroupMemberDto[]>(
        HttpMethods.GET,
        `/users?username=${encodeURIComponent(username)}&exact=true`,
      );
      if (users?.length) {
        this.userCache.set(name, users[0]);
        return users[0];
      }
      return undefined;
    };

    let user = await tryExact(name);

    const deploymentTarget = await this.getDeploymentTarget();
    if (!user && deploymentTarget !== DEPLOYMENT_TARGET.LINUXMUSTER) {
      const candidate = this.toKeycloakUsernameIfNeeded(name);
      if (candidate !== name) {
        user = await tryExact(candidate);
      }
    }

    if (!user) {
      if (/\s/.test(name)) {
        const plain = LdapKeycloakSyncService.stripDiacritics(name).trim().replace(/\s+/g, ' ');
        const parts = plain.split(' ');
        const first = parts[0]?.toLowerCase();
        const last = parts[parts.length - 1]?.toLowerCase();

        if (first && last) {
          const results = await this.keycloakQueue.enqueue<GroupMemberDto[]>(
            HttpMethods.GET,
            `/users?search=${encodeURIComponent(plain)}`,
          );

          const candidates = (results || []).filter((u) => {
            const f = u.firstName ? String(u.firstName) : '';
            const l = u.lastName ? String(u.lastName) : '';
            const fPlain = LdapKeycloakSyncService.stripDiacritics(f).toLowerCase();
            const lPlain = LdapKeycloakSyncService.stripDiacritics(l).toLowerCase();
            return fPlain === first && lPlain === last;
          });

          if (candidates.length === 1) {
            const [only] = candidates;
            user = only;
          } else if (candidates.length > 1) {
            const [second] = candidates;
            user = second;
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

    const groups = await this.keycloakQueue.enqueue<Group[]>(
      HttpMethods.GET,
      `/groups?search=${encodeURIComponent(name)}`,
    );

    const match = groups.find((group) => group.name === name);
    if (match) {
      this.groupCache.set(name, match);
      return LDAP_MEMBER_TYPES.GROUP;
    }

    return LDAP_MEMBER_TYPES.MISSING;
  }

  private static extractDn(raw: string | string[] | Buffer | Buffer[]): string {
    return Array.isArray(raw) ? raw[0].toString() : raw.toString();
  }

  private static extractCn(dn: string): string | null {
    const match = /^CN=([^,]+)/i.exec(dn);
    return match ? match[1] : null;
  }

  private static parseGroupDn(groupDn: string): { groupPath: string; cn: string } {
    const match = /^CN=([^,]+)/i.exec(groupDn);

    if (!match) throw new Error(`Invalid DN: ${groupDn}`);

    const cn = match[1];
    return { groupPath: `/${cn}`, cn };
  }

  private async applyUpdatesDeduped(updates: Array<{ userId: string; add: string[]; remove: string[] }>) {
    const byUser = new Map<string, { add: Set<string>; remove: Set<string> }>();

    updates.forEach((user) => {
      const entry = byUser.get(user.userId) || { add: new Set<string>(), remove: new Set<string>() };
      user.add.forEach((g) => entry.add.add(g));
      user.remove.forEach((g) => entry.remove.add(g));
      byUser.set(user.userId, entry);
    });

    const tasks = Array.from(byUser.entries()).map(async ([userId, { add, remove }]) => {
      add.forEach((groupId) => {
        if (remove.has(groupId)) {
          add.delete(groupId);
          remove.delete(groupId);
        }
      });

      if (add.size || remove.size) {
        Logger.verbose(
          `Applying updates for user=${userId}: add=[${Array.from(add).join(',')}] remove=[${Array.from(remove).join(',')}]`,
          LdapKeycloakSyncService.name,
        );
        await this.updateUserGroups(userId, Array.from(add), Array.from(remove));
      }
    });

    await Promise.all(tasks);
  }

  private async updateUserGroups(userId: string, toAddIds: string[], toRemoveIds: string[]) {
    try {
      await Promise.all(
        toAddIds.map((groupId) => this.keycloakQueue.enqueue(HttpMethods.PUT, `/users/${userId}/groups/${groupId}`)),
      );
      await Promise.all(
        toRemoveIds.map((groupId) =>
          this.keycloakQueue.enqueue(HttpMethods.DELETE, `/users/${userId}/groups/${groupId}`),
        ),
      );
    } catch (error) {
      Logger.error(`Failed to update ${userId}`, (error as Error).stack, LdapKeycloakSyncService.name);
    }
  }

  private static stripDiacritics(input: string): string {
    return input
      .normalize('NFKD')
      .replace(/ß/g, 'ss')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private static cnToKeycloakUsername(cn: string): string {
    const plain = LdapKeycloakSyncService.stripDiacritics(cn).trim().replace(/\s+/g, ' ');

    const parts = plain.split(' ');
    if (parts.length === 1) {
      return parts[0].toLowerCase();
    }

    const first = parts[0];
    const last = parts[parts.length - 1];
    return `${first}.${last}`.toLowerCase();
  }

  private toKeycloakUsernameIfNeeded(name: string): string {
    if (this.deploymentTarget === DEPLOYMENT_TARGET.LINUXMUSTER) return name;

    const hasComma = name.includes(',');
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const looksLikeHumanReadableName = hasComma || parts.length >= 2;

    return looksLikeHumanReadableName ? LdapKeycloakSyncService.cnToKeycloakUsername(name) : name;
  }

  private async getDeploymentTarget(): Promise<DeploymentTarget> {
    if (!this.deploymentTarget) {
      this.deploymentTarget =
        (await this.cache.get<DeploymentTarget>(DEPLOYMENT_TARGET_CACHE_KEY)) ?? DEPLOYMENT_TARGET.LINUXMUSTER;
    }
    return this.deploymentTarget;
  }
}

export default LdapKeycloakSyncService;
