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
import { ALL_GROUPS_CACHE_KEY, GROUP_WITH_MEMBERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import SPECIAL_SCHOOLS from '@libs/common/constants/specialSchools';
import tls from 'node:tls';
import { Group } from '@libs/groups/types/group';
import LdapConfig from '@libs/ldapKeycloakSync/types/ldapConfig';
import formatLdapDate from '@libs/ldapKeycloakSync/utils/formatLdapDate';
import LDAP_SYNC_INTERVAL_MS from '@libs/ldapKeycloakSync/constants/ldapSyncIntervalMs';
import LDAPS_PREFIX from '@libs/ldapKeycloakSync/constants/ldapsPrefix';
import { HttpMethods } from '@libs/common/types/http-methods';
import GroupWithMembers from '@libs/groups/types/groupWithMembers';
import GroupMemberDto from '@libs/groups/types/groupMember.dto';
import SearchEntry from '@libs/ldapKeycloakSync/types/searchEntry';
import LDAP_ATTRIBUTE from '@libs/ldapKeycloakSync/constants/ldapAttribute';
import LDAP_MEMBER_TYPES from '@libs/ldapKeycloakSync/constants/ldapMemberTypes';
import LdapMemberType from '@libs/ldapKeycloakSync/types/ldapMemberType';
import keycloakUserStorageProvider from '@libs/ldapKeycloakSync/constants/keycloakUserStorageProvider';
import { KEYCLOAK_STARTUP_TIMEOUT_MS } from '@libs/ldapKeycloakSync/constants/keycloakSyncValues';
import { LdapKeycloakSync, LdapKeycloakSyncDocument } from './ldap-keycloak-sync.schema';
import GlobalSettingsService from '../global-settings/global-settings.service';
import KeycloakRequestQueue from './queue/keycloak-request.queue';
import GroupsService from '../groups/groups.service';

const PAGINATION = {
  PAGE_SIZE: 100,
};

@Injectable()
class LdapKeycloakSyncService implements OnModuleInit {
  private ldapConfig?: LdapConfig;

  private lastSync = new Date(0);

  private isSyncRunning = false;

  private userCache = new Map<string, GroupMemberDto>();

  private groupCache = new Map<string, Group>();

  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly globalSettingsService: GlobalSettingsService,
    private readonly groupsService: GroupsService,
    @InjectModel(LdapKeycloakSync.name) private ldapKeycloakSyncModel: Model<LdapKeycloakSyncDocument>,
    private readonly keycloakQueue: KeycloakRequestQueue,
  ) {}

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  onModuleInit() {
    Logger.log('Initialized, waiting for Keycloak startup', LdapKeycloakSyncService.name);
  }

  @Timeout(KEYCLOAK_STARTUP_TIMEOUT_MS)
  async init() {
    await this.loadLdapConfig();
    await this.loadLastSync();
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

    this.isSyncRunning = true;
    try {
      const client = await this.setupClient();

      Logger.debug(`Delta sync since ${this.lastSync.toISOString()}`, LdapKeycloakSyncService.name);

      const syncSince = new Date();

      const entries = await this.searchChangedGroups(client);
      const toRefresh = await this.collectRefreshDns(client, entries);

      const updates = await this.buildUpdates(client, toRefresh);
      await this.applyUpdates(updates);

      this.lastSync = syncSince;
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
    const targetGroup = await this.ensureKeycloakGroup(groupPath);

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

    const finalMembers = await this.fetchAllKeycloakGroupUsers(targetGroup.id);
    await this.groupsService.updateGroupWithMembersInCache(targetGroup, finalMembers);
  }

  public async reconcileNamedGroupMembers(
    targetGroupName: string,
    desiredUsernames: string[] = [],
    desiredGroupNames: string[] = [],
  ): Promise<void> {
    const groupPath = targetGroupName.startsWith('/') ? targetGroupName : `/${targetGroupName}`;

    const targetGroup = await this.ensureKeycloakGroup(groupPath);

    const expandedGroupUsers = (await Promise.all(desiredGroupNames.map((name) => this.expandGroupNameToUsers(name))))
      .flat()
      .map((u) => u.username);

    const allDesiredUsernames = new Set([...desiredUsernames, ...expandedGroupUsers]);

    const desiredUsers = await Promise.all(
      Array.from(allDesiredUsernames).map(async (name) => {
        const type = await this.resolveLdapMember(name);
        return type === LDAP_MEMBER_TYPES.USER ? this.userCache.get(name) : undefined;
      }),
    );

    const desiredIds = new Set(desiredUsers.filter((u): u is GroupMemberDto => Boolean(u)).map((u) => u.id));

    const currentMembers = await this.fetchAllKeycloakGroupUsers(targetGroup.id);
    const currentIds = new Set(currentMembers.map((u) => u.id));

    const toAdd = Array.from(desiredIds).filter((id) => !currentIds.has(id));
    const toRemove = Array.from(currentIds).filter((id) => !desiredIds.has(id));

    await Promise.all(toAdd.map((id) => this.updateUserGroups(id, [targetGroup.id], [])));
    await Promise.all(toRemove.map((id) => this.updateUserGroups(id, [], [targetGroup.id])));

    const finalMembers = await this.fetchAllKeycloakGroupUsers(targetGroup.id);
    await this.groupsService.updateGroupWithMembersInCache(targetGroup, finalMembers);
  }

  private async expandGroupNameToUsers(name: string): Promise<GroupMemberDto[]> {
    const allGroups = (await this.cache.get<Group[]>(ALL_GROUPS_CACHE_KEY + SPECIAL_SCHOOLS.GLOBAL)) || [];
    const root = allGroups.find((g) => g.name === name || g.path === `/${name}`);
    if (root) {
      const collectIds = (g: Group): string[] => [g.id, ...(g.subGroups || []).flatMap((sg) => collectIds(sg))];
      const ids = collectIds(root);
      const batches = await Promise.all(ids.map((id) => this.fetchAllKeycloakGroupUsers(id)));
      return batches.flat();
    }
    const type = await this.resolveLdapMember(name);
    if (type === LDAP_MEMBER_TYPES.GROUP) {
      const subgroup = this.groupCache.get(name)!;
      return this.fetchAllKeycloakGroupUsers(subgroup.id);
    }
    return [];
  }

  private async loadLastSync() {
    const ldapKeycloakSyncDocument = await this.ldapKeycloakSyncModel.findOne().lean();
    if (ldapKeycloakSyncDocument?.lastSync) this.lastSync = ldapKeycloakSyncDocument.lastSync;
  }

  private async persistLastSync() {
    await this.ldapKeycloakSyncModel.updateOne({}, { lastSync: this.lastSync }, { upsert: true });
  }

  private async loadLdapConfig() {
    const configs = await this.keycloakQueue.enqueue<LdapConfig[]>(HttpMethods.GET, '/components');

    this.ldapConfig = configs.find((c) => c.providerType === keycloakUserStorageProvider);

    Logger.verbose(`Loaded LDAP config ${this.ldapConfig?.id}`, LdapKeycloakSyncService.name);
  }

  private async getBindCredentials() {
    const ldapConfig = await this.globalSettingsService.getGlobalSettings('general.ldap');

    const bindDN = ldapConfig?.general?.ldap?.binduser?.dn;
    const bindPassword = ldapConfig?.general?.ldap?.binduser?.password;

    if (!bindDN || !bindPassword) {
      throw new Error('Missing LDAP bind credentials');
    }

    return { bindDN, bindPassword };
  }

  private async setupClient(): Promise<Client> {
    const { bindDN, bindPassword } = await this.getBindCredentials();

    const url = process.env.LDAP_TUNNEL_URL || this.ldapConfig!.config.connectionUrl[0];

    const ldapClientOptions: { url: string; tlsOptions?: tls.ConnectionOptions } = { url };

    if (url.startsWith(LDAPS_PREFIX)) ldapClientOptions.tlsOptions = { rejectUnauthorized: false };

    const ldapClient = new Client(ldapClientOptions);

    if (this.ldapConfig!.config.startTls?.[0] === 'true') {
      await ldapClient.startTLS({ rejectUnauthorized: false });
    }

    await ldapClient.bind(bindDN, bindPassword);

    return ldapClient;
  }

  private async searchChangedGroups(ldapClient: Client) {
    const base = this.ldapConfig!.config.usersDn[0];
    const filter = `(&(objectClass=group)(whenChanged>=${formatLdapDate(this.lastSync)}))`;
    const ldapSearchOptions: SearchOptions = {
      scope: 'sub',
      filter,
      attributes: [LDAP_ATTRIBUTE.DN, LDAP_ATTRIBUTE.MEMBER],
    };

    const { searchEntries } = await ldapClient.search(base, ldapSearchOptions);

    Logger.verbose(`Found ${searchEntries.length} changed groups`, LdapKeycloakSyncService.name);

    return searchEntries;
  }

  private async collectRefreshDns(ldapClient: Client, entries: SearchEntry[]) {
    const dnSet = new Set<string>();
    await Promise.all(
      entries.map(async (entry) => {
        const dn = LdapKeycloakSyncService.extractDn(entry.distinguishedName);

        dnSet.add(dn);

        const parents = await this.fetchParents(ldapClient, dn);

        parents.forEach((parent) => dnSet.add(parent));
      }),
    );
    return dnSet;
  }

  private async fetchParents(ldapClient: Client, dn: string, visitedDnSet = new Set<string>()): Promise<string[]> {
    if (visitedDnSet.has(dn)) return [];

    visitedDnSet.add(dn);

    const base = this.ldapConfig!.config.usersDn[0];
    const filter = `(&(objectClass=group)(member=${dn}))`;
    const ldapSearchOptions: SearchOptions = { scope: 'sub', filter, attributes: [LDAP_ATTRIBUTE.DN] };

    const { searchEntries } = await ldapClient.search(base, ldapSearchOptions);

    const searchResult = searchEntries.map((entry) => LdapKeycloakSyncService.extractDn(entry.distinguishedName));
    const children = await Promise.all(
      searchResult.map((parent) => this.fetchParents(ldapClient, parent, visitedDnSet)),
    );

    return [...searchResult, ...children.flat()];
  }

  private async buildUpdates(ldapClient: Client, dns: Set<string>) {
    const updates: Array<{ userId: string; add: string[]; remove: string[] }> = [];

    await Promise.all(
      Array.from(dns).map(async (dn) => {
        const { groupPath } = LdapKeycloakSyncService.parseGroupDn(dn);

        const existingGroup = await this.ensureKeycloakGroup(groupPath);

        const usernames = await this.fetchMembers(ldapClient, dn);

        const cacheKey = `${GROUP_WITH_MEMBERS_CACHE_KEY}-${groupPath}`;
        const cachedGroup = (await this.cache.get<GroupWithMembers>(cacheKey)) || existingGroup;

        const toAddUsernames = usernames.filter((u) => !cachedGroup.members.some((m) => m.username === u));
        const toRemoveMembers = cachedGroup.members.filter((m) => !usernames.includes(m.username));

        await Promise.all(toAddUsernames.map((u) => this.handleAdd(u, existingGroup, cachedGroup, updates)));

        toRemoveMembers.forEach((m) => {
          updates.push({ userId: m.id, add: [], remove: [existingGroup.id] });
          cachedGroup.members = cachedGroup.members.filter((x) => x.id !== m.id);
        });

        await this.groupsService.updateGroupWithMembersInCache(existingGroup, cachedGroup.members);
      }),
    );

    return updates;
  }

  private async fetchMembers(client: Client, dn: string, visited = new Set<string>()): Promise<string[]> {
    if (visited.has(dn)) return [];

    visited.add(dn);

    const opts: SearchOptions = { scope: 'base', filter: '(objectClass=group)', attributes: [LDAP_ATTRIBUTE.MEMBER] };
    const { searchEntries } = await client.search(dn, opts);

    if (!searchEntries.length) return [];

    const { member } = searchEntries[0];
    let raw: (string | Buffer<ArrayBufferLike>)[];

    if (Array.isArray(member)) {
      raw = member;
    } else if (member) {
      raw = [member];
    } else {
      raw = [];
    }

    const names = await Promise.all(
      raw.map(async (rawDn) => {
        const dnString = typeof rawDn === 'string' ? rawDn : rawDn.toString();

        const cn = LdapKeycloakSyncService.extractCn(dnString);
        if (!cn) return null;

        const ldapMemberType = await this.resolveLdapMember(cn);

        if (ldapMemberType === LDAP_MEMBER_TYPES.GROUP) {
          return (await this.fetchMembers(client, dnString, visited)).filter(Boolean);
        }

        return ldapMemberType === LDAP_MEMBER_TYPES.USER ? cn : null;
      }),
    );

    return names.flat().filter((n): n is string => !!n);
  }

  private async handleAdd(
    username: string,
    group: GroupWithMembers,
    cache: GroupWithMembers,
    updates: Array<{ userId: string; add: string[]; remove: string[] }>,
  ) {
    const ldapMemberType = await this.resolveLdapMember(username);

    if (ldapMemberType === LDAP_MEMBER_TYPES.USER) {
      const user = this.userCache.get(username)!;

      updates.push({ userId: user.id, add: [group.id], remove: [] });

      cache.members.push(user);
    } else {
      const subgroup = this.groupCache.get(username)!;

      const members = await this.fetchAllKeycloakGroupUsers(subgroup.id);

      members.forEach((u) => {
        updates.push({ userId: u.id, add: [group.id], remove: [] });
        cache.members.push(u);
      });
    }
  }

  private async ensureKeycloakGroup(groupPath: string): Promise<GroupWithMembers> {
    const allGroups = (await this.cache.get<Group[]>(ALL_GROUPS_CACHE_KEY + SPECIAL_SCHOOLS.GLOBAL)) || [];
    let currentGroup = allGroups.find((group) => group.path === groupPath);

    if (!currentGroup) {
      const name = groupPath.slice(1);

      await this.keycloakQueue.enqueue(HttpMethods.POST, '/groups', { name }, { validateStatus: (s) => s === 201 });

      [currentGroup] = await this.keycloakQueue.enqueue<Group[]>(
        HttpMethods.GET,
        `/groups?search=${encodeURIComponent(name)}`,
      );

      allGroups.push(currentGroup);

      await this.cache.set(ALL_GROUPS_CACHE_KEY + SPECIAL_SCHOOLS.GLOBAL, allGroups);

      Logger.debug(`Created group ${groupPath}`, LdapKeycloakSyncService.name);
    }
    return { ...currentGroup, members: [] };
  }

  private async fetchKeycloakGroupUsers(groupId: string, first = 0): Promise<GroupMemberDto[]> {
    return this.keycloakQueue.enqueue<GroupMemberDto[]>(
      HttpMethods.GET,
      `/groups/${groupId}/members?first=${first}&max=${PAGINATION.PAGE_SIZE}`,
    );
  }

  private fetchAllKeycloakGroupUsers(groupId: string): Promise<GroupMemberDto[]> {
    const allMembers: GroupMemberDto[] = [];
    let first = 0;

    const fetchBatch = async (): Promise<GroupMemberDto[]> => {
      const batch = await this.fetchKeycloakGroupUsers(groupId, first);

      allMembers.push(...batch);

      first += batch.length;

      if (batch.length === PAGINATION.PAGE_SIZE) {
        return fetchBatch();
      }
      return allMembers;
    };

    return fetchBatch();
  }

  private async resolveLdapMember(name: string): Promise<LdapMemberType> {
    if (this.userCache.has(name)) return LDAP_MEMBER_TYPES.USER;
    if (this.groupCache.has(name)) return LDAP_MEMBER_TYPES.GROUP;

    const users = await this.keycloakQueue.enqueue<GroupMemberDto[]>(
      HttpMethods.GET,
      `/users?username=${encodeURIComponent(name)}&exact=true`,
    );
    if (users.length) {
      this.userCache.set(name, users[0]);
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

  private async applyUpdates(updates: Array<{ userId: string; add: string[]; remove: string[] }>) {
    await Promise.all(updates.map((u) => this.updateUserGroups(u.userId, u.add, u.remove)));
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
}

export default LdapKeycloakSyncService;
