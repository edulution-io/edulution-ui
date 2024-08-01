import axios from 'axios';
import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { LDAPUser } from '@libs/groups/types/ldapUser';
import { Group } from '@libs/groups/types/group';
import CustomHttpException from '@libs/error/CustomHttpException';
import GroupsErrorMessage from '@libs/groups/types/groupsErrorMessage';
import { GROUPS_CACHE_TTL_MS } from '@libs/common/contants/cacheTtl';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import executeNowAndRepeatedly from '@libs/common/utils/executeNowAndRepeatedly';
import KEYCLOAK_JWT_EXPIRE_IN_MS from '@libs/common/contants/keycloakJwtExpireMs';
import GroupMemberDto from '@libs/groups/types/groupMember.dto';
import { ALL_GROUPS_CACHE_KEY, GROUPS_WITH_MEMBERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';

@Injectable()
class GroupsService implements OnModuleInit {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private keycloakAccessToken: string;

  onModuleInit() {
    void this.scheduleCacheUpdates();
  }

  private async scheduleCacheUpdates() {
    await executeNowAndRepeatedly(() => this.obtainAccessToken(), KEYCLOAK_JWT_EXPIRE_IN_MS * 0.9);
    await executeNowAndRepeatedly(() => this.updateGroupsAndMembersInCache(), GROUPS_CACHE_TTL_MS * 0.5);
  }

  private keycloakEduApiBaseUrl = process.env.KEYCLOAK_EDU_API as string;

  private keycloakEduApiClientId = process.env.KEYCLOAK_EDU_API_CLIENT_ID as string;

  private keycloakEduApiClientSecret = process.env.KEYCLOAK_EDU_API_CLIENT_SECRET as string;

  async obtainAccessToken() {
    const tokenEndpoint = `${this.keycloakEduApiBaseUrl}protocol/openid-connect/token`;

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.keycloakEduApiClientId,
      client_secret: this.keycloakEduApiClientSecret,
    });

    try {
      const response = await axios.post<{ access_token: string }>(tokenEndpoint, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      this.keycloakAccessToken = response.data.access_token;
    } catch (error) {
      Logger.error(error, GroupsService.name);
    }
  }

  private keycloakBaseUrl = process.env.KEYCLOAK_API as string;

  private async makeAuthorizedRequest<T>(
    method: string,
    urlPath: string,
    token: string,
    queryParams: string = '',
  ): Promise<T> {
    const url = `${this.keycloakBaseUrl}${urlPath}?${queryParams}`;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${token}`,
    };
    const config = {
      method,
      url,
      headers,
      maxBodyLength: Infinity,
    };

    const response = await axios.request<T>(config);
    return response.data;
  }

  async fetchAllUsers(token: string): Promise<LDAPUser[]> {
    try {
      return await this.makeAuthorizedRequest<LDAPUser[]>('get', 'users', token);
    } catch (e) {
      throw new CustomHttpException(GroupsErrorMessage.CouldNotGetUsers, HttpStatus.BAD_GATEWAY, e);
    }
  }

  private static sanitizeGroup(group: Group) {
    return { id: group.id, name: group.name, path: group.path };
  }

  private static sanitizeGroupMembers(members: LDAPUser[]): GroupMemberDto[] {
    return members.map((member: LDAPUser) => ({
      id: member.id,
      username: member.username,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
    }));
  }

  async updateGroupsAndMembersInCache() {
    try {
      const groups = await this.fetchAllGroups(this.keycloakAccessToken);
      await this.cacheManager.set(ALL_GROUPS_CACHE_KEY, groups, GROUPS_CACHE_TTL_MS);

      const promises = groups.map(async (group) => {
        const members = await this.fetchGroupMembers(this.keycloakAccessToken, group.id);
        const sanitizedMembers = GroupsService.sanitizeGroupMembers(members);
        const sanitizedGroup = GroupsService.sanitizeGroup(group);

        await this.cacheManager.set(
          `${GROUPS_WITH_MEMBERS_CACHE_KEY}-${group.path}`,
          {
            ...sanitizedGroup,
            members: sanitizedMembers,
          },
          GROUPS_CACHE_TTL_MS,
        );
      });

      await Promise.all(promises);

      Logger.log(`${groups.length} groups and their members updated successfully in cache. ✅`, GroupsService.name);
    } catch (e) {
      Logger.error(e, GroupsService.name);
    }
  }

  private static flattenGroups(groups: Group[]) {
    const flatGroups: Group[] = [];

    function traverseSubGroups(group: Group) {
      flatGroups.push(group);

      if (group.subGroups && group.subGroups.length > 0) {
        group.subGroups.forEach((subGroup) => traverseSubGroups(subGroup));
        // eslint-disable-next-line no-param-reassign
        group.subGroups = [];
      }
    }

    groups.forEach((group) => traverseSubGroups(group));

    return flatGroups;
  }

  async fetchAllGroups(token: string): Promise<Group[]> {
    try {
      const groups = await this.makeAuthorizedRequest<Group[]>('get', 'groups', token, 'search');
      return GroupsService.flattenGroups(groups);
    } catch (e) {
      throw new CustomHttpException(GroupsErrorMessage.CouldNotGetUsers, HttpStatus.BAD_GATEWAY, e);
    }
  }

  async fetchGroupMembers(token: string, groupId: string): Promise<LDAPUser[]> {
    try {
      return await this.makeAuthorizedRequest<LDAPUser[]>(
        'get',
        `groups/${groupId}/members`,
        token,
        'briefRepresentation=true',
      );
    } catch (e) {
      throw new CustomHttpException(GroupsErrorMessage.CouldNotFetchGroupMembers, HttpStatus.BAD_GATEWAY, e);
    }
  }

  public async searchGroups(searchKeyWord?: string): Promise<Group[]> {
    try {
      const groups = await this.cacheManager.get<Group[]>(ALL_GROUPS_CACHE_KEY);
      if (!groups) {
        return [];
      }

      if (!searchKeyWord) {
        return groups;
      }

      return groups.filter((group) => group.path.includes(searchKeyWord));
    } catch (e) {
      throw new CustomHttpException(GroupsErrorMessage.CouldNotSearchGroups, HttpStatus.BAD_GATEWAY, e);
    }
  }
}

export default GroupsService;
