import axios from 'axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DetailedUserInfo, LDAPUser } from '../types/ldapUser';
import UsersService from '../users/users.service';
import { GroupInfo } from '../types/groups';

@Injectable()
class ClassManagementService {
  async fetchClassesInfo(token: string, groupPath: string): Promise<GroupInfo> {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://auth.schulung.multi.schule/auth/admin/realms/edulution/group-by-path/${groupPath}`,
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
      url: `https://auth.schulung.multi.schule/auth/admin/realms/edulution/groups/${groupId}/members?briefRepresentation=true`,
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
      url: `https://auth.schulung.multi.schule/auth/admin/realms/edulution/users/${userId}`,
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

  public async fetchAllGroups(token: string): Promise<GroupInfo[]> {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://auth.schulung.multi.schule/auth/admin/realms/edulution/groups?search=',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      Logger.log('Sending request to fetch all groups', 'UsersService');
      const response = await axios.request<GroupInfo[]>(config);
      Logger.log('Response received', 'UsersService');
      Logger.log(response.status, 'UsersService'); // Log status code
      Logger.log(response.statusText, 'UsersService'); // Log status text
      Logger.log(response.headers, 'UsersService'); // Log headers
      Logger.log(response.data, 'UsersService'); // Log response data

      if (!response.data || response.data.length === 0) {
        Logger.warn('Empty response received from the API', 'UsersService');
      }

      return response.data;
    } catch (e) {
      Logger.error(e, 'UsersService'); // Ensure correct service name
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