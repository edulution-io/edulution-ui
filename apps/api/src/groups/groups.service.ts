import axios from 'axios';
import { Interval, SchedulerRegistry } from '@nestjs/schedule';
import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { LDAPUser } from '@libs/groups/types/ldapUser';
import { Group } from '@libs/groups/types/group';
import CustomHttpException from '@libs/error/CustomHttpException';
import GroupsErrorMessage from '@libs/groups/types/groupsErrorMessage';
import { GROUPS_CACHE_TTL_MS, KEYCLOACK_SYNC_MS } from '@libs/common/constants/cacheTtl';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import GroupMemberDto from '@libs/groups/types/groupMember.dto';
import { ALL_GROUPS_CACHE_KEY, GROUPS_WITH_MEMBERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import { readFileSync } from 'fs';
import { JwtService } from '@nestjs/jwt';
import { HTTP_HEADERS, HttpMethods, RequestResponseContentType } from '@libs/common/types/http-methods';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import AUTH_PATHS from '@libs/auth/constants/auth-endpoints';
import PUBLIC_KEY_FILE_PATH from '@libs/common/constants/pubKeyFilePath';
import GROUPS_TOKEN_INTERVAL from '@libs/groups/constants/schedulerRegistry';

const { KEYCLOAK_EDU_UI_REALM, KEYCLOAK_API, KEYCLOAK_EDU_API_CLIENT_ID, KEYCLOAK_EDU_API_CLIENT_SECRET } =
  process.env as {
    [key: string]: string;
  };

@Injectable()
class GroupsService implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  private keycloakAccessToken: string;

  private accessTokenRefreshInterval: number = 5000;

  async onModuleInit() {
    this.scheduleTokenRefresh();
    await this.initializeService();
  }

  private async initializeService() {
    await this.obtainAccessToken();

    await this.updateGroupsAndMembersInCache();
  }

  scheduleTokenRefresh() {
    const callback = () => {
      void this.obtainAccessToken();
    };

    const interval = setInterval(callback, this.accessTokenRefreshInterval);
    this.schedulerRegistry.addInterval(GROUPS_TOKEN_INTERVAL, interval);
  }

  async obtainAccessToken() {
    const tokenEndpoint = `${KEYCLOAK_API}/realms/${KEYCLOAK_EDU_UI_REALM}${AUTH_PATHS.AUTH_OIDC_TOKEN_PATH}`;

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: KEYCLOAK_EDU_API_CLIENT_ID,
      client_secret: KEYCLOAK_EDU_API_CLIENT_SECRET,
    });

    try {
      const response = await axios.post<{ access_token: string }>(tokenEndpoint, params.toString(), {
        headers: { [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED },
      });

      const pubKey = readFileSync(PUBLIC_KEY_FILE_PATH, 'utf8');

      const decoded: JwtUser = await this.jwtService.verifyAsync<JwtUser>(response.data.access_token, {
        publicKey: pubKey,
        algorithms: ['RS256'],
      });

      this.keycloakAccessToken = response.data.access_token;

      const newInterval = (decoded.exp - decoded.iat) * 1000 * 0.9;
      if (newInterval !== this.accessTokenRefreshInterval) {
        this.accessTokenRefreshInterval = newInterval;
        this.updateTokenRefreshInterval();
      }
    } catch (error) {
      Logger.error(error, GroupsService.name);
    }
  }

  updateTokenRefreshInterval() {
    this.schedulerRegistry.deleteInterval(GROUPS_TOKEN_INTERVAL);
    this.scheduleTokenRefresh();
  }

  private static async makeAuthorizedRequest<T>(
    method: HttpMethods,
    urlPath: string,
    token: string,
    queryParams: string = '',
  ): Promise<T> {
    const url = `${KEYCLOAK_API}/admin/realms/${KEYCLOAK_EDU_UI_REALM}/${urlPath}?${queryParams}`;
    const headers = {
      [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED,
      [HTTP_HEADERS.Authorization]: `Bearer ${token}`,
    };
    const config = {
      method: method as string,
      url,
      headers,
      maxBodyLength: Infinity,
    };

    const response = await axios.request<T>(config);
    return response.data;
  }

  static async fetchAllUsers(token: string): Promise<LDAPUser[]> {
    try {
      return await GroupsService.makeAuthorizedRequest<LDAPUser[]>(HttpMethods.GET, 'users', token);
    } catch (e) {
      throw new CustomHttpException(GroupsErrorMessage.CouldNotGetUsers, HttpStatus.BAD_GATEWAY);
    }
  }

  static async fetchCurrentUser(token: string): Promise<JwtUser> {
    try {
      const tokenEndpoint = `${KEYCLOAK_API}/realms/${KEYCLOAK_EDU_UI_REALM}${AUTH_PATHS.AUTH_OIDC_USERINFO_PATH}`;

      const response = await axios.get<JwtUser>(tokenEndpoint, {
        headers: {
          [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED,
          [HTTP_HEADERS.Authorization]: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (e) {
      throw new CustomHttpException(GroupsErrorMessage.CouldNotGetUsers, HttpStatus.BAD_GATEWAY);
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

  @Interval(KEYCLOACK_SYNC_MS)
  async updateGroupsAndMembersInCache() {
    try {
      const groups = await GroupsService.fetchAllGroups(this.keycloakAccessToken);
      await this.cacheManager.set(ALL_GROUPS_CACHE_KEY, groups, GROUPS_CACHE_TTL_MS);

      const promises = groups.map(async (group) => {
        const members = await GroupsService.fetchGroupMembers(this.keycloakAccessToken, group.id);
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

  private static flattenGroups(groups: Group[]): Group[] {
    const flatGroups: Group[] = [];

    function traverseSubGroups(group: Group): Group {
      flatGroups.push(group);

      if (group.subGroups && group.subGroups.length > 0) {
        const updatedSubGroups = group.subGroups.map((subGroup) => traverseSubGroups(subGroup));
        return { ...group, subGroups: updatedSubGroups };
      }

      return group;
    }

    groups.forEach((group) => traverseSubGroups(group));

    return flatGroups;
  }

  static async fetchAllGroups(token: string): Promise<Group[]> {
    try {
      const groups = await GroupsService.makeAuthorizedRequest<Group[]>(HttpMethods.GET, 'groups', token, 'search');
      return GroupsService.flattenGroups(groups);
    } catch (e) {
      throw new CustomHttpException(GroupsErrorMessage.CouldNotGetUsers, HttpStatus.BAD_GATEWAY);
    }
  }

  static async fetchGroupMembers(token: string, groupId: string): Promise<LDAPUser[]> {
    try {
      return await GroupsService.makeAuthorizedRequest<LDAPUser[]>(
        HttpMethods.GET,
        `groups/${groupId}/members`,
        token,
        'briefRepresentation=true',
      );
    } catch (e) {
      throw new CustomHttpException(GroupsErrorMessage.CouldNotFetchGroupMembers, HttpStatus.BAD_GATEWAY);
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
      throw new CustomHttpException(GroupsErrorMessage.CouldNotSearchGroups, HttpStatus.BAD_GATEWAY, searchKeyWord);
    }
  }
}

export default GroupsService;
