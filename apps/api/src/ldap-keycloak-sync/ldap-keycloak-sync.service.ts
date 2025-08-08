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
import SearchEntry from '@libs/ldapKeycloakSync/types/searchEntry';
import LdapConfig from '@libs/ldapKeycloakSync/types/ldapConfig';
import formatLdapDate from '@libs/ldapKeycloakSync/utils/formatLdapDate';
import LDAP_SYNC_INTERVAL_MS from '@libs/ldapKeycloakSync/constants/ldapSyncIntervalMs';
import LDAPS_PREFIX from '@libs/ldapKeycloakSync/constants/ldapsPrefix';
import KEYCLOAK_STARTUP_TIMEOUT from '@libs/ldapKeycloakSync/constants/keycloakStartupTimeout';
import { HttpMethods } from '@libs/common/types/http-methods';
import GroupWithMembers from '@libs/groups/types/groupWithMembers';
import GroupMemberDto from '@libs/groups/types/groupMember.dto';
import { LdapKeycloakSync, LdapKeycloakSyncDocument } from './ldap-keycloak-sync.schema';
import GlobalSettingsService from '../global-settings/global-settings.service';
import KeycloakRequestQueue from './queue/keycloak-request.queue';
import GroupsService from '../groups/groups.service';

const { KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD } = process.env as Record<string, string>;

@Injectable()
class LdapKeycloakSyncService implements OnModuleInit {
  private userCache = new Map<string, GroupMemberDto>();

  private ldapConfig: LdapConfig | undefined;

  private lastSync = new Date(0);

  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly globalSettingsService: GlobalSettingsService,
    private readonly groupsService: GroupsService,
    @InjectModel(LdapKeycloakSync.name) private ldapKeycloakSyncModel: Model<LdapKeycloakSyncDocument>,
    private readonly keycloakQueue: KeycloakRequestQueue,
  ) {}

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  onModuleInit() {
    if (!KEYCLOAK_ADMIN || !KEYCLOAK_ADMIN_PASSWORD) {
      Logger.error(
        'KEYCLOAK_ADMIN and KEYCLOAK_ADMIN_PASSWORD environment variables must be set.',
        LdapKeycloakSyncService.name,
      );
      return;
    }

    Logger.log('LdapKeycloakSyncService initialized. Wait 60s for Keycloak to be ready', LdapKeycloakSyncService.name);
  }

  private async loadLastSync() {
    const ldapKeycloakSyncDocument = await this.ldapKeycloakSyncModel.findOne().lean();
    if (ldapKeycloakSyncDocument?.lastSync) {
      this.lastSync = ldapKeycloakSyncDocument.lastSync;
    }
  }

  private async saveLastSync() {
    await this.ldapKeycloakSyncModel.updateOne({}, { lastSync: this.lastSync }, { upsert: true });
  }

  @Timeout(KEYCLOAK_STARTUP_TIMEOUT)
  async handleTimeout() {
    await this.loadLdapConfig();
    await this.loadLastSync();
  }

  private async loadLdapConfig() {
    const configs = await this.keycloakQueue.enqueue<LdapConfig[]>(HttpMethods.GET, '/components');
    if (!configs.length) {
      Logger.error('No LDAPStorageProvider configured in Keycloak', LdapKeycloakSyncService.name);
      return;
    }
    this.ldapConfig = configs.find((c) => c.providerType === 'org.keycloak.storage.UserStorageProvider');
    Logger.verbose(`Cached LDAP config (id=${this.ldapConfig?.id})`, LdapKeycloakSyncService.name);
  }

  @Interval(LDAP_SYNC_INTERVAL_MS)
  async syncModifiedGroups() {
    if (!this.ldapConfig) {
      Logger.error('Missing LDAP config, aborting', LdapKeycloakSyncService.name);
      return;
    }

    Logger.debug(`Starting delta sync since ${this.lastSync.toISOString()}`, LdapKeycloakSyncService.name);

    try {
      const { bindDN, bindCredentials } = await this.getBindCredentials();
      const client = this.createLdapClient();

      await this.ensureStartTls(client);
      await client.bind(bindDN, bindCredentials);

      const entries = await this.fetchChangedGroups(client);
      await client.unbind();

      const toUpdate = await this.buildUpdateQueue(entries);
      await this.applyUpdates(toUpdate);

      this.lastSync = new Date();
      await this.saveLastSync();
      Logger.debug('Delta sync complete', LdapKeycloakSyncService.name);
    } catch (error) {
      Logger.error(
        `LDAP sync failed: ${(error as Error).message}`,
        (error as Error).stack,
        LdapKeycloakSyncService.name,
      );
    }
  }

  private async getBindCredentials(): Promise<{ bindDN: string; bindCredentials: string }> {
    const bindCredentials = await this.globalSettingsService.getGlobalSettings('general.ldap');
    const bindDN = bindCredentials?.general?.ldap?.binduser?.dn;
    const bindPassword = bindCredentials?.general?.ldap?.binduser?.password;

    if (!bindDN || !bindPassword) {
      throw new Error('Missing bind credentials');
    }

    return { bindDN, bindCredentials: bindPassword };
  }

  private createLdapClient(): Client {
    const url = process.env.LDAP_TUNNEL_URL || this.ldapConfig!.config.connectionUrl[0];
    const options: { url: string; tlsOptions?: tls.ConnectionOptions } = { url };
    if (url.startsWith(LDAPS_PREFIX)) {
      options.tlsOptions = { rejectUnauthorized: false };
    }
    return new Client(options);
  }

  private async ensureStartTls(client: Client): Promise<void> {
    const startTls = this.ldapConfig!.config.startTls?.[0] === 'true';
    if (startTls) {
      Logger.verbose('Starting TLS', LdapKeycloakSyncService.name);
      await client.startTLS({ rejectUnauthorized: false });
    }
  }

  private async fetchChangedGroups(ldapClient: Client) {
    const baseDN = this.ldapConfig!.config.usersDn[0];
    const filter = `(&(objectClass=group)(whenChanged>=${formatLdapDate(this.lastSync)}))`;
    const searchOptions: SearchOptions = { scope: 'sub', filter, attributes: ['distinguishedName', 'member'] };
    const { searchEntries } = await ldapClient.search(baseDN, searchOptions);

    Logger.verbose(`Found ${searchEntries.length} entries`, LdapKeycloakSyncService.name);
    return searchEntries;
  }

  private async ensureKeycloakGroup(groupPath: string): Promise<GroupWithMembers> {
    const allCachedGroups: Group[] = (await this.cache.get(ALL_GROUPS_CACHE_KEY + SPECIAL_SCHOOLS.GLOBAL)) || [];
    const alreadyExistingGroup = allCachedGroups.find((g) => g.path === groupPath);
    if (alreadyExistingGroup) {
      return { ...alreadyExistingGroup, members: [] };
    }

    const name = groupPath.replace(/^\//, '');
    await this.keycloakQueue.enqueue(HttpMethods.POST, '/groups', { name }, { validateStatus: (s) => s === 201 });

    const createdGroup = (
      await this.keycloakQueue.enqueue<Group[]>(HttpMethods.GET, `/groups?search=${encodeURIComponent(name)}`)
    )[0];

    const newGroup: Group = { id: createdGroup.id, path: groupPath, name, subGroups: [] };
    allCachedGroups.push(newGroup);
    await this.cache.set(ALL_GROUPS_CACHE_KEY + SPECIAL_SCHOOLS.GLOBAL, allCachedGroups);

    Logger.debug(`Created new Keycloak group ${groupPath} (id=${createdGroup.id})`, LdapKeycloakSyncService.name);
    return { ...createdGroup, members: [] };
  }

  private async resolveUserDetails(usernames: string[]): Promise<GroupMemberDto[]> {
    const toFetch = usernames.filter((u) => !this.userCache.has(u));

    if (toFetch.length) {
      await Promise.all(
        toFetch.map(async (username) => {
          const [user] = await this.keycloakQueue.enqueue<GroupMemberDto[]>(
            HttpMethods.GET,
            `/users?username=${encodeURIComponent(username)}`,
          );
          if (user?.id) {
            this.userCache.set(username, {
              id: user.id,
              username: user.username,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            });
          }
        }),
      );
    }

    return usernames.map((u) => this.userCache.get(u)).filter((u): u is GroupMemberDto => !!u);
  }

  private async buildUpdateQueue(entries: SearchEntry[]) {
    this.userCache.clear();

    const results = await Promise.all(
      entries.map(async (entry) => {
        const { groupPath, members: entryMembers } = LdapKeycloakSyncService.parseLdapSearchEntry(entry);
        const existingGroup = await this.ensureKeycloakGroup(groupPath);

        const cachedGroup =
          (await this.cache.get<GroupWithMembers>(`${GROUP_WITH_MEMBERS_CACHE_KEY}-${groupPath}`)) || existingGroup;

        const toAddNames = entryMembers.filter((u) => !cachedGroup.members.some((m) => m.username === u));
        const toRemoveIds = cachedGroup.members.filter((m) => !entryMembers.includes(m.username)).map((m) => m.id);

        const addedUsers = toAddNames.length ? await this.resolveUserDetails(toAddNames) : [];

        const retainedUsers = cachedGroup.members.filter((m) => entryMembers.includes(m.username));
        const finalUsers = [...retainedUsers, ...addedUsers];

        await this.groupsService.updateGroupWithMembersInCache(cachedGroup, finalUsers);

        return [
          ...addedUsers.map((u) => ({ userId: u.id, add: [existingGroup.id], remove: [] })),
          ...toRemoveIds.map((id) => ({ userId: id, add: [], remove: [existingGroup.id] })),
        ];
      }),
    );

    return results.flat();
  }

  private static parseLdapSearchEntry(entry: SearchEntry): { groupPath: string; members: string[] } {
    const dnRaw = entry.distinguishedName;
    let dn: string;

    if (Array.isArray(dnRaw)) {
      dn = dnRaw[0].toString();
    } else if (dnRaw instanceof Buffer) {
      dn = dnRaw.toString();
    } else {
      dn = dnRaw as string;
    }

    const cnMatch = /^CN=([^,]+)/i.exec(dn);
    const cn = cnMatch ? cnMatch[1] : '';
    const groupPath = `/${cn}`;

    let raw: (string | Buffer)[];

    if (Array.isArray(entry.member)) {
      raw = entry.member;
    } else if (entry.member) {
      raw = [entry.member];
    } else {
      raw = [];
    }

    const members = raw
      .map((m) => {
        const s = typeof m === 'string' ? m : m.toString();
        return s.match(/^CN=([^,]+)/i)?.[1] || null;
      })
      .filter((u: string | null): u is string => !!u);

    return { groupPath, members };
  }

  private async applyUpdates(updates: Array<{ userId: string; add: string[]; remove: string[] }>) {
    await Promise.all(updates.map(async (upd) => this.updateUserGroups(upd.userId, upd.add, upd.remove)));
  }

  private async updateUserGroups(userId: string, toAdd: string[], toRemove: string[]): Promise<void> {
    try {
      await Promise.all(toAdd.map((g) => this.keycloakQueue.enqueue(HttpMethods.PUT, `/users/${userId}/groups/${g}`)));
      await Promise.all(
        toRemove.map((g) => this.keycloakQueue.enqueue(HttpMethods.DELETE, `/users/${userId}/groups/${g}`)),
      );
    } catch (error) {
      Logger.error(
        `Failed to update groups for user: ${userId} ${(error as Error).message}`,
        (error as Error).stack,
        LdapKeycloakSyncService.name,
      );
    }
  }
}

export default LdapKeycloakSyncService;
