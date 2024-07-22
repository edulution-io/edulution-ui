import qs from 'qs';
import axios from 'axios';
import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { LDAPUser } from '@libs/groups/types/ldapUser';
import { Group } from '@libs/groups/types/group';
import CustomHttpException from '@libs/error/CustomHttpException';
import GroupsErrorMessage from '@libs/groups/types/groupsErrorMessage';
import { GROUPS_CACHE_TTL_MS } from '@libs/common/contants/cache-ttl';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import executeNowAndRepeatedly from '@libs/common/utils/executeNowAndRepeatedly';
import JWT_EXPIRE_IN_MS from '@libs/common/contants/jwt-expire-ms';
import GroupMemberDto from '@libs/groups/types/groupMember.dto';
import GroupDto from '@libs/groups/types/group.dto';
import JWTUser from '../types/JWTUser';
import processLdapGroups from '@libs/user/utils/processLdapGroups';
import UserGroupsDto from '@libs/groups/types/userGroups.dto';
import LdapUserWithGroups from '@libs/groups/types/ldapUserWithGroups';
import { ALL_GROUPS_CACHE_KEY, GROUPS_WITH_MEMBERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import LmnApiService from '../lmnApi/lmnApi.service';

@Injectable()
class GroupsService implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly lmnApiService: LmnApiService,
  ) {}

  private keycloakAccessToken: string;

  onModuleInit() {
    void this.scheduleCacheUpdates();
  }

  private async scheduleCacheUpdates() {
    await executeNowAndRepeatedly(() => this.obtainAccessToken(), JWT_EXPIRE_IN_MS * 0.9);
    await executeNowAndRepeatedly(() => this.updateGroupsAndMembersInCache(), GROUPS_CACHE_TTL_MS * 0.5);
  }

  private keycloakEduApiBaseUrl = process.env.KEYCLOAK_EDU_API as string;
  private keycloakEduApiClientId = process.env.KEYCLOAK_EDU_API_CLIENT_ID as string;
  private keycloakEduApiClientSecret = process.env.KEYCLOAK_EDU_API_CLIENT_SECRET as string;

  async obtainAccessToken() {
    const tokenEndpoint = `${this.keycloakEduApiBaseUrl}protocol/openid-connect/token`;

    const data = qs.stringify({
      grant_type: 'client_credentials',
      client_id: this.keycloakEduApiClientId,
      client_secret: this.keycloakEduApiClientSecret,
    });

    try {
      const response = await axios.post(tokenEndpoint, data, {
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

  async getFilteredGroupsByPaths(groupPaths: string[]): Promise<GroupDto[]> {
    const groups = await Promise.all(
      groupPaths.map(async (path) => await this.cacheManager.get<GroupDto>(`${GROUPS_WITH_MEMBERS_CACHE_KEY}-${path}`)),
    );
    return groups.filter((group): group is GroupDto => !!group);
  }

  async getUserGroups(user: JWTUser, lmnApiToken: string): Promise<UserGroupsDto> {
    const ldapGroups = processLdapGroups(user.ldapGroups);

    const classes = await this.getFilteredGroupsByPaths(ldapGroups.classPaths);
    const projects = await this.getFilteredGroupsByPaths(ldapGroups.projectPaths);
    const sessions = await this.lmnApiService.getUserSessions(lmnApiToken, user.preferred_username);

    return { projects, classes, sessions };
  }

  private sanitizeGroup(group: Group) {
    return { id: group.id, name: group.name, path: group.path };
  }

  private sanitizeGroupMembers(members: LDAPUser[]): GroupMemberDto[] {
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

      for (const group of groups) {
        const members = await this.fetchGroupMembers(this.keycloakAccessToken, group.id);

        const sanitizedMembers = this.sanitizeGroupMembers(members);
        const sanitizedGroup = this.sanitizeGroup(group);

        await this.cacheManager.set(
          `${GROUPS_WITH_MEMBERS_CACHE_KEY}-${group.path}`,
          {
            ...sanitizedGroup,
            members: sanitizedMembers,
          },
          GROUPS_CACHE_TTL_MS,
        );
      }

      Logger.log(`${groups.length} groups and their members updated successfully in cache. ✅`, GroupsService.name);
    } catch (e) {
      Logger.error(e, GroupsService.name);
    }
  }

  private flattenGroups(groups: Group[]) {
    let flatGroups: Group[] = [];

    function traverseSubGroups(group: Group) {
      flatGroups.push(group);

      if (group.subGroups && group.subGroups.length > 0) {
        group.subGroups.forEach((subGroup) => traverseSubGroups(subGroup));
        group.subGroups = [];
      }
    }

    groups.forEach((group) => traverseSubGroups(group));

    return flatGroups;
  }

  async fetchAllGroups(token: string): Promise<Group[]> {
    try {
      const groups = await this.makeAuthorizedRequest<Group[]>('get', 'groups', token, 'search');
      return this.flattenGroups(groups);
    } catch (e) {
      throw new CustomHttpException(GroupsErrorMessage.CouldNotGetUsers, HttpStatus.BAD_GATEWAY, e);
    }
  }

  async getGroupByPath(token: string, groupPath: string): Promise<Group> {
    const cacheKey = `groupPath_${groupPath}`;
    try {
      const cachedGroup = await this.cacheManager.get<Group>(cacheKey);
      if (cachedGroup) {
        return cachedGroup;
      }

      const fetchedGroup = await this.makeAuthorizedRequest<Group>('get', `group-by-path/${groupPath}`, token);
      await this.cacheManager.set(cacheKey, fetchedGroup, GROUPS_CACHE_TTL_MS);
      return fetchedGroup;
    } catch (e) {
      throw new CustomHttpException(GroupsErrorMessage.CouldNotGetGroupByPath, HttpStatus.BAD_GATEWAY, e);
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

  async getUserByUsername(token: string, username: string): Promise<LdapUserWithGroups> {
    const cacheKey = `user_${username}`;

    try {
      const cachedUser = await this.cacheManager.get<LdapUserWithGroups>(cacheKey);
      if (cachedUser) {
        return cachedUser;
      }

      const fetchedUser = await this.makeAuthorizedRequest<LdapUserWithGroups>(
        'get',
        `users`,
        token,
        `q=username:${username}`,
      );

      await this.cacheManager.set(cacheKey, fetchedUser, GROUPS_CACHE_TTL_MS);

      return fetchedUser;
    } catch (e) {
      throw new CustomHttpException(GroupsErrorMessage.CouldNotFetchUserById, HttpStatus.BAD_GATEWAY, e);
    }
  }

  async getOwnUserInfo(token: string, username: string): Promise<JWTUser> {
    const cacheKey = `userinfo_${username}`;

    try {
      const cachedUser = await this.cacheManager.get<JWTUser>(cacheKey);
      if (cachedUser) {
        return cachedUser;
      }

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`,
      };
      const config = {
        method: 'get',
        url: `${this.keycloakEduApiBaseUrl}protocol/openid-connect/userinfo`,
        headers,
        maxBodyLength: Infinity,
      };

      const response = await axios.request<JWTUser>(config);

      await this.cacheManager.set(cacheKey, response.data, GROUPS_CACHE_TTL_MS);

      return response.data;
    } catch (e) {
      throw new CustomHttpException(GroupsErrorMessage.CouldNotFetchUserById, HttpStatus.BAD_GATEWAY, e);
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
