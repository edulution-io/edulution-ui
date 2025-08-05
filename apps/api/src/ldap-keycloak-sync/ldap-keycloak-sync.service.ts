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
import axios, { AxiosInstance } from 'axios';
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
import createKeycloakAxiosClient from '../scripts/keycloak/utilities/createKeycloakAxiosClient';
import getKeycloakToken from '../scripts/keycloak/utilities/getKeycloakToken';
import { LdapKeycloakSync, LdapKeycloakSyncDocument } from './ldap-keycloak-sync.schema';
import GlobalSettingsService from '../global-settings/global-settings.service';

const { KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD } = process.env as Record<string, string>;

@Injectable()
class LdapKeycloakSyncService implements OnModuleInit {
  private userIdCache = new Map<string, string>();

  private ldapConfig: LdapConfig | undefined;

  private keycloakClient: AxiosInstance;

  private lastSync = new Date(0);

  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly globalSettingsService: GlobalSettingsService,
    @InjectModel(LdapKeycloakSync.name) private ldapKeycloakSyncModel: Model<LdapKeycloakSyncDocument>,
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
    await this.initKeycloakClient();
    await this.loadLdapConfig();
    await this.loadLastSync();
  }

  private async keycloakRequest<T>(fn: (client: AxiosInstance) => Promise<T>, attempt = 1): Promise<T> {
    try {
      return await fn(this.keycloakClient);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401 && attempt === 1) {
        await this.initKeycloakClient();
        return this.keycloakRequest(fn, attempt + 1);
      }
      throw error;
    }
  }

  private async initKeycloakClient() {
    const token = await getKeycloakToken();
    this.keycloakClient = createKeycloakAxiosClient(token);
  }

  private async loadLdapConfig() {
    const response = await this.keycloakRequest((client) => client.get<LdapConfig[]>(`/components`));

    if (!response.data.length) {
      Logger.error('No LDAPStorageProvider configured in Keycloak', LdapKeycloakSyncService.name);
    }

    this.ldapConfig = response.data.find(
      (config) => config.providerType === 'org.keycloak.storage.UserStorageProvider',
    );

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

  private async ensureKeycloakGroup(groupPath: string): Promise<string> {
    const allCachedGroups: Group[] = (await this.cache.get(ALL_GROUPS_CACHE_KEY + SPECIAL_SCHOOLS.GLOBAL)) || [];
    const alreadyExistingGroup = allCachedGroups.find((g) => g.path === groupPath);
    if (alreadyExistingGroup) {
      return alreadyExistingGroup.id;
    }

    const name = groupPath.replace(/^\//, '');
    await this.keycloakRequest((client) =>
      client.post('/groups', { name }, { validateStatus: (status) => status === 201 }),
    );

    const [createdGroup] = (
      await this.keycloakRequest((client) => client.get<Group[]>(`/groups?search=${encodeURIComponent(name)}`))
    ).data;

    const newGroup: Group = { id: createdGroup.id, path: groupPath, name, subGroups: [] };
    allCachedGroups.push(newGroup);
    await this.cache.set(ALL_GROUPS_CACHE_KEY + SPECIAL_SCHOOLS.GLOBAL, allCachedGroups);

    Logger.debug(`Created new Keycloak group ${groupPath} (id=${createdGroup.id})`, LdapKeycloakSyncService.name);
    return createdGroup.id;
  }

  private async resolveUserIds(usernames: string[]): Promise<Array<{ id: string; username: string }>> {
    const toFetch = usernames.filter((u) => !this.userIdCache.has(u));

    if (toFetch.length > 0) {
      await Promise.all(
        toFetch.map((username) =>
          this.keycloakRequest((client) =>
            client.get<{ id: string; username?: string }[]>(`/users?username=${encodeURIComponent(username)}`),
          ).then((resp) => {
            const user = resp.data[0];
            if (user?.id) {
              this.userIdCache.set(username, user.id);
            }
          }),
        ),
      );
    }

    return usernames.reduce<Array<{ id: string; username: string }>>((result, username) => {
      const id = this.userIdCache.get(username);
      if (id) {
        result.push({ username, id });
      }
      return result;
    }, []);
  }

  private async buildUpdateQueue(entries: SearchEntry[]) {
    this.userIdCache.clear();

    const results = await Promise.all(
      entries.map(async (entry) => {
        const { groupPath, members } = LdapKeycloakSyncService.parseLdapSearchEntry(entry);
        const groupId = await this.ensureKeycloakGroup(groupPath);

        const cachedGroup = (await this.cache.get<{ members: Array<{ id: string; username: string }> }>(
          `${GROUP_WITH_MEMBERS_CACHE_KEY}-${groupPath}`,
        )) || { members: [] };

        const existingMembers = cachedGroup.members;
        const missingUsernames = members.filter((u) => !existingMembers.some((m) => m.username === u));
        const resolvedUsers = missingUsernames.length ? await this.resolveUserIds(missingUsernames) : [];

        const toAddIds = resolvedUsers.map((r) => r.id);
        const toRemoveIds = existingMembers.filter((m) => !members.includes(m.username)).map((m) => m.id);

        return [
          ...toAddIds.map((id) => ({ userId: id, add: [groupId], remove: [] })),
          ...toRemoveIds.map((id) => ({ userId: id, add: [], remove: [groupId] })),
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
      await Promise.all(
        toAdd.map((g) => this.keycloakRequest((client) => client.put(`/users/${userId}/groups/${g}`, {}))),
      );
      await Promise.all(
        toRemove.map((g) => this.keycloakRequest((client) => client.delete(`/users/${userId}/groups/${g}`))),
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
