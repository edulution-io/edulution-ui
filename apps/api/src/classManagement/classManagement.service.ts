import axios from 'axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DetailedUserInfo, LDAPUser } from '../types/ldapUser';
import UsersService from '../users/users.service';
import { GroupInfo } from '../types/groups';

@Injectable()
class ClassManagementService {
  private keycloakBaseUrl = process.env.KEYCLOAK_API;

  async fetchClassesInfo(token: string, groupPath: string): Promise<GroupInfo> {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${this.keycloakBaseUrl}group-by-path/${groupPath}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.request<GroupInfo>(config);
      return response.data;
    } catch (e) {
      Logger.error(e, UsersService.name);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async fetchGroupMembers(token: string, groupId: string): Promise<LDAPUser[]> {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${this.keycloakBaseUrl}groups/${groupId}/members?briefRepresentation=true`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.request<LDAPUser[]>(config);
      return response.data;
    } catch (e) {
      Logger.error(e, UsersService.name);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async fetchUserDetails(token: string, userId: string): Promise<DetailedUserInfo> {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${this.keycloakBaseUrl}users/${userId}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.request<DetailedUserInfo>(config);

      return response.data;
    } catch (e) {
      Logger.error(e, UsersService.name);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  public async fetchAllGroups(token: string, searchKeyWord?: string): Promise<GroupInfo[]> {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${this.keycloakBaseUrl}groups?search=${searchKeyWord}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      Logger.log('Sending request to fetch all groups', 'UsersService');
      const response = await axios.request<GroupInfo[]>(config);
      Logger.log('Response received', 'UsersService');
      if (!response.data || response.data.length === 0) {
        Logger.warn('Empty response received from the API', 'UsersService');
      }

      return response.data;
    } catch (e) {
      Logger.error(e, 'UsersService');
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  public async getClassMembersWithDetails(token: string, groupPath: string) {
    const classInfo = await this.fetchClassesInfo(token, groupPath);
    const groupId = classInfo.id;
    const members = await this.fetchGroupMembers(token, groupId);
    const memberDetailsPromises = members.map((member) => this.fetchUserDetails(token, member.id));
    return Promise.all(memberDetailsPromises);
  }
}
export default ClassManagementService;
