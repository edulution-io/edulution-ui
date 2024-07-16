import axios from 'axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { GroupsUser } from '@libs/user/types/groups/groupsUser';
import { LDAPUser } from '@libs/user/types/groups/ldapUser';
import { Group } from '@libs/user/types/groups/group';
import CustomHttpException from '@libs/error/CustomHttpException';
import GroupsErrorMessage from '@libs/user/types/groups/groupsErrorMessage';

@Injectable()
class GroupsService {
  private keycloakBaseUrl = process.env.KEYCLOAK_API as string;

  private async makeRequest<T>(method: string, urlPath: string, token: string, queryParams: string = ''): Promise<T> {
    const url = `${this.keycloakBaseUrl}${urlPath}${queryParams}`;
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

  async fetchUsers(token: string): Promise<LDAPUser[]> {
    try {
      return await this.makeRequest<LDAPUser[]>('get', 'users', token);
    } catch (e) {
      throw new CustomHttpException(GroupsErrorMessage.CouldNotGetUsers, HttpStatus.BAD_GATEWAY, e);
    }
  }

  async fetchGroupByPath(token: string, groupPath: string): Promise<Group> {
    try {
      return await this.makeRequest<Group>('get', `group-by-path/${groupPath}`, token);
    } catch (e) {
      throw new CustomHttpException(GroupsErrorMessage.CouldNotGetGroupByPath, HttpStatus.BAD_GATEWAY, e);
    }
  }

  async fetchGroupMembers(token: string, groupId: string): Promise<LDAPUser[]> {
    try {
      return await this.makeRequest<LDAPUser[]>('get', `groups/${groupId}/members`, token, '?briefRepresentation=true');
    } catch (e) {
      throw new CustomHttpException(GroupsErrorMessage.CouldNotFetchGroupMembers, HttpStatus.BAD_GATEWAY, e);
    }
  }

  async fetchUserById(token: string, userId: string): Promise<GroupsUser> {
    try {
      return await this.makeRequest<GroupsUser>('get', `users/${userId}`, token);
    } catch (e) {
      throw new CustomHttpException(GroupsErrorMessage.CouldNotFetchUserById, HttpStatus.BAD_GATEWAY, e);
    }
  }

  public async searchGroups(token: string, searchKeyWord = ''): Promise<Group[]> {
    try {
      return await this.makeRequest<Group[]>('get', 'groups', token, `?search=${searchKeyWord}`);
    } catch (e) {
      throw new CustomHttpException(GroupsErrorMessage.CouldNotSearchGroups, HttpStatus.BAD_GATEWAY, e);
    }
  }
}

export default GroupsService;
