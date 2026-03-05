/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import DEVICE_FIELDS from '@libs/deviceManagement/constants/deviceFields';
import {
  DEVICES_LMN_API_ENDPOINT,
  EXAM_MODE_LMN_API_ENDPOINT,
  LIST_MANAGEMENT_LMN_API_ENDPOINT,
  MANAGEMENT_GROUPS_LMN_API_ENDPOINT,
  PRINT_PASSWORDS_LMN_API_ENDPOINT,
  PRINTERS_LMN_API_ENDPOINT,
  PROJECTS_LMN_API_ENDPOINT,
  QUERY_LMN_API_ENDPOINT,
  QUOTAS_LMN_API_ENDPOINT,
  SCHOOL_CLASSES_LMN_API_ENDPOINT,
  SESSIONS_LMN_API_ENDPOINT,
  USER_ROOM_LMN_API_ENDPOINT,
  USERS_LMN_API_ENDPOINT,
} from '@libs/lmnApi/constants/lmnApiEndpoints';
import LmnApiErrorMessage from '@libs/lmnApi/types/lmnApiErrorMessage';
import LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSearchResult from '@libs/lmnApi/types/lmnApiSearchResult';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import { Agent as HttpsAgent } from 'https';
import type FileExportFormat from '@libs/classManagement/types/fileExportFormat';
import PrintPasswordsRequest from '@libs/classManagement/types/printPasswordsRequest';
import LmnApiProjectWithMembers from '@libs/lmnApi/types/lmnApiProjectWithMembers';
import GroupForm from '@libs/groups/types/groupForm';
import DEFAULT_SCHOOL from '@libs/lmnApi/constants/defaultSchool';
import LmnApiPrinter from '@libs/lmnApi/types/lmnApiPrinter';
import { HTTP_HEADERS, HttpMethods, ResponseType } from '@libs/common/types/http-methods';
import UpdateUserDetailsDto from '@libs/userSettings/update-user-details.dto';
import type QuotaResponse from '@libs/lmnApi/types/lmnApiQuotas';
import { decodeBase64Api } from '@libs/common/utils/getBase64StringApi';
import GroupJoinState from '@libs/classManagement/constants/joinState.enum';
import GroupFormDto from '@libs/groups/types/groupForm.dto';
import LmnApiJobResult from '@libs/lmnApi/types/lmn-api-job.result';
import LmnApiRoom from '@libs/lmnApi/types/lmnApiRoom';
import SOPHOMORIX_QUERY_PARAMS from '@libs/userManagement/constants/sophomorixQueryParams';
import type ListManagementEntry from '@libs/userManagement/types/listManagementEntry';
import type { SophomorixCheckResponse } from '@libs/userManagement/types/sophomorixCheckResponse';
import CustomHttpException from '../common/CustomHttpException';
import UsersService from '../users/users.service';
import LdapKeycloakSyncService from '../ldap-keycloak-sync/ldap-keycloak-sync.service';
import LmnApiRequestQueue from './queue/lmn-api-request.queue';

@Injectable()
class LmnApiService {
  private lmnApiBaseUrl = process.env.LMN_API_BASE_URL as string;

  private lmnApi: AxiosInstance;

  private readonly requestTimeout = +(process.env.LMN_API_TIMEOUT_MS ?? 15000);

  constructor(
    private readonly usersService: UsersService,
    private readonly ldapKeycloakSyncService: LdapKeycloakSyncService,
    private readonly lmnApiQueue: LmnApiRequestQueue,
  ) {
    const httpsAgent = new HttpsAgent({
      rejectUnauthorized: false,
    });
    this.lmnApi = axios.create({
      baseURL: this.lmnApiBaseUrl,
      httpsAgent,
      timeout: this.requestTimeout,
    });
  }

  private request<T>(
    method: HttpMethods,
    endpoint: string,
    payload?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<LmnApiJobResult<T>> {
    return this.lmnApiQueue.enqueue<T>(method, endpoint, payload, config);
  }

  public async printPasswords(lmnApiToken: string, options: PrintPasswordsRequest): Promise<LmnApiJobResult<Buffer>> {
    try {
      return await this.request<Buffer>(HttpMethods.POST, PRINT_PASSWORDS_LMN_API_ENDPOINT, options, {
        responseType: ResponseType.ARRAYBUFFER,
        headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
      });
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.PrintPasswordsFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async getStudentsList(
    lmnApiToken: string,
    schoolclass: string,
    format: FileExportFormat,
  ): Promise<LmnApiJobResult<Buffer>> {
    try {
      const endpoint = `${SCHOOL_CLASSES_LMN_API_ENDPOINT}/${schoolclass}/${format}_students_list`;
      return await this.request<Buffer>(HttpMethods.GET, endpoint, undefined, {
        responseType: ResponseType.ARRAYBUFFER,
        headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
      });
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetStudentsListFailed,
        HttpStatus.BAD_GATEWAY,
        `${schoolclass}: ${format}`,
        LmnApiService.name,
      );
    }
  }

  public async getLmnApiToken(username: string): Promise<string> {
    const password = await this.usersService.getPassword(username);
    const { data } = await this.lmnApi.get<string>('/auth/', {
      auth: { username, password },
      timeout: 10_000,
      validateStatus: () => true,
    });

    return data || ' ';
  }

  public async startExamMode(lmnApiToken: string, users: string[]): Promise<unknown> {
    try {
      const response = await this.request<unknown>(
        HttpMethods.POST,
        `${EXAM_MODE_LMN_API_ENDPOINT}/start`,
        { users },
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.StartExamModeFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async stopExamMode(
    lmnApiToken: string,
    users: string[],
    groupType: string,
    groupName: string,
  ): Promise<unknown> {
    try {
      const response = await this.request<unknown>(
        HttpMethods.POST,
        `${EXAM_MODE_LMN_API_ENDPOINT}/stop`,
        { users, group_name: groupName, group_type: groupType },
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.StopExamModeFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async removeManagementGroup(lmnApiToken: string, group: string, users: string[]): Promise<LmnApiSchoolClass> {
    try {
      const response = await this.request<LmnApiSchoolClass>(
        HttpMethods.DELETE,
        `${MANAGEMENT_GROUPS_LMN_API_ENDPOINT}/${group}/members`,
        { users },
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );

      void this.ldapKeycloakSyncService.updateGroupMembershipByNames(group, [], users);

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.RemoveManagementGroupFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async addManagementGroup(lmnApiToken: string, group: string, users: string[]): Promise<LmnApiSchoolClass> {
    try {
      const response = await this.request<LmnApiSchoolClass>(
        HttpMethods.POST,
        `${MANAGEMENT_GROUPS_LMN_API_ENDPOINT}/${group}/members`,
        { users },
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );

      void this.ldapKeycloakSyncService.updateGroupMembershipByNames(group, users, []);

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.AddManagementGroupFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async getSchoolClass(
    lmnApiToken: string,
    schoolClassName: string,
    allMembers = false,
  ): Promise<LmnApiSchoolClass> {
    try {
      const queryParam = allMembers ? '?all_members=true' : '';
      const response = await this.request<LmnApiSchoolClass>(
        HttpMethods.GET,
        `${SCHOOL_CLASSES_LMN_API_ENDPOINT}/${schoolClassName}${queryParam}`,
        undefined,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetUserSchoolClassFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async getUserSchoolClasses(lmnApiToken: string): Promise<LmnApiSchoolClass[]> {
    const requestUrl = `${SCHOOL_CLASSES_LMN_API_ENDPOINT}`;
    const config = {
      headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
    };

    try {
      const response = await this.request<LmnApiSchoolClass[]>(HttpMethods.GET, requestUrl, undefined, config);
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetUserSchoolClassesFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async updateSchoolClass(
    lmnApiToken: string,
    formValues: GroupFormDto,
    username: string,
  ): Promise<LmnApiSchoolClass> {
    try {
      const data = LmnApiService.getGroupFormData(formValues, username);
      const response = await this.request<LmnApiSchoolClass>(
        HttpMethods.PATCH,
        `${SCHOOL_CLASSES_LMN_API_ENDPOINT}/${formValues.name}`,
        data,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.UpdateSchoolClassFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async toggleSchoolClassJoined(
    lmnApiToken: string,
    schoolClass: string,
    action: GroupJoinState,
    username?: string,
  ): Promise<LmnApiSchoolClass> {
    const requestUrl = `${SCHOOL_CLASSES_LMN_API_ENDPOINT}/${schoolClass}/${action}`;

    const config = {
      headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
    };

    try {
      const response = await this.request<LmnApiSchoolClass>(HttpMethods.POST, requestUrl, undefined, config);

      if (username) {
        const add = action === GroupJoinState.Join ? [username] : [];
        const remove = action !== GroupJoinState.Join ? [username] : [];
        void this.ldapKeycloakSyncService.updateGroupMembershipByNames(schoolClass, add, remove);
      }

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.ToggleSchoolClassJoinedFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async getUserSession(lmnApiToken: string, sessionId: string, username: string): Promise<LmnApiSession> {
    try {
      const response = await this.request<LmnApiSession>(
        HttpMethods.GET,
        `${SESSIONS_LMN_API_ENDPOINT}/${username}/${sessionId}`,
        undefined,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetUserSessionsFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async addUserSession(lmnApiToken: string, formValues: GroupForm, username: string): Promise<LmnApiSession> {
    try {
      const data = { users: formValues.members };

      const response = await this.request<LmnApiSession>(
        HttpMethods.POST,
        `${SESSIONS_LMN_API_ENDPOINT}/${username}/${formValues.name}`,
        data,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.AddUserSessionsFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async updateUserSession(lmnApiToken: string, formValues: GroupForm, username: string): Promise<LmnApiSession> {
    try {
      await this.removeUserSession(lmnApiToken, formValues.id, username);

      const data = { users: formValues.members };

      const response = await this.request<LmnApiSession>(
        HttpMethods.POST,
        `${SESSIONS_LMN_API_ENDPOINT}/${username}/${formValues.name}`,
        data,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.UpdateUserSessionsFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async removeUserSession(lmnApiToken: string, sessionId: string, username: string): Promise<LmnApiSession> {
    try {
      const response = await this.request<LmnApiSession>(
        HttpMethods.DELETE,
        `${SESSIONS_LMN_API_ENDPOINT}/${username}/${sessionId}`,
        undefined,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.RemoveUserSessionsFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async getUserSessions(
    lmnApiToken: string,
    username: string,
    withMemberDetails: boolean,
  ): Promise<LmnApiSession[]> {
    try {
      const response = await this.request<LmnApiSession[]>(
        HttpMethods.GET,
        `${SESSIONS_LMN_API_ENDPOINT}/${username}?members_details=${withMemberDetails}`,
        undefined,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetUserSessionsFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async getUser(lmnApiToken: string, username: string, checkFirstPassword = false): Promise<LmnUserInfo> {
    try {
      const query = `?check_first_pw=${checkFirstPassword}`;
      const response = await this.request<LmnUserInfo>(
        HttpMethods.GET,
        `${USERS_LMN_API_ENDPOINT}/${username}${query}`,
        undefined,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetUserFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async getUsers(lmnApiToken: string, usernames: string[]): Promise<LmnUserInfo[]> {
    try {
      return await Promise.all(
        usernames.map((username) =>
          this.request<LmnUserInfo>(HttpMethods.GET, `${USERS_LMN_API_ENDPOINT}/${username}`, undefined, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          }).then((response) => response.data),
        ),
      );
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetUsersFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async updateUser(
    lmnApiToken: string,
    userDetails: Partial<UpdateUserDetailsDto>,
    username: string,
  ): Promise<LmnUserInfo> {
    try {
      await this.request<null>(HttpMethods.POST, `${USERS_LMN_API_ENDPOINT}/${username}`, userDetails, {
        headers: {
          [HTTP_HEADERS.XApiKey]: lmnApiToken,
        },
      });
      return await this.getUser(lmnApiToken, username);
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.UpdateUserFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async getUsersQuota(lmnApiToken: string, username: string): Promise<QuotaResponse> {
    try {
      const response = await this.request<QuotaResponse>(
        HttpMethods.GET,
        `${USERS_LMN_API_ENDPOINT}/${username}/${QUOTAS_LMN_API_ENDPOINT}`,
        undefined,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetUsersQuotaFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async getCurrentUserRoom(lmnApiToken: string, username: string): Promise<LmnApiRoom> {
    try {
      const response = await this.request<LmnApiRoom>(
        HttpMethods.GET,
        `${USER_ROOM_LMN_API_ENDPOINT}/${username}`,
        undefined,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetCurrentUserRoomFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async searchUsersOrGroups(
    lmnApiToken: string,
    school: string,
    searchQuery: string,
  ): Promise<LmnApiSearchResult[]> {
    try {
      const response = await this.request<LmnApiSearchResult[]>(
        HttpMethods.GET,
        `${QUERY_LMN_API_ENDPOINT}/${school}/${searchQuery}`,
        undefined,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.SearchUsersOrGroupsFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  private static getGroupFormData = (formValues: GroupFormDto, username: string) => ({
    admins: formValues.admins,
    displayName: formValues.displayName,
    admingroups: formValues.admingroups,
    description: formValues.description,
    join: formValues.join,
    hide: formValues.hide,
    members: formValues.members.filter((m) => m !== username),
    membergroups: formValues.membergroups,
    school: formValues.school || DEFAULT_SCHOOL,
    mailalias: formValues.mailalias,
    maillist: formValues.maillist,
    mailquota: formValues.mailquota,
    proxyAddresses: formValues.proxyAddresses,
    quota: formValues.quota,
  });

  public async getUserProjects(lmnApiToken: string): Promise<LmnApiProject[]> {
    try {
      const response = await this.request<LmnApiProject[]>(HttpMethods.GET, PROJECTS_LMN_API_ENDPOINT, undefined, {
        headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
      });
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetUserProjectsFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  private reconcileProjectMembers(username: string, formValues: GroupFormDto) {
    const { members, admins, name, school, membergroups, admingroups } = formValues;
    const addUsers = [username, ...members, ...admins].filter(Boolean);
    const addGroups = [...membergroups, ...admingroups].filter(Boolean);

    const projectName = name.startsWith('p_') ? name : `p_${school === DEFAULT_SCHOOL ? '' : `${school}-`}${name}`;

    void this.ldapKeycloakSyncService.reconcileNamedGroupMembers(projectName, addUsers, addGroups);
  }

  public async getProject(lmnApiToken: string, projectName: string): Promise<LmnApiProjectWithMembers> {
    try {
      const response = await this.request<LmnApiProjectWithMembers>(
        HttpMethods.GET,
        `${PROJECTS_LMN_API_ENDPOINT}/${projectName}?all_members=true`,
        undefined,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      const members = response.data.members.filter((member) => response.data.all_members.includes(member.cn));
      return { ...response.data, members };
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetProjectFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async createProject(lmnApiToken: string, formValues: GroupFormDto, username: string): Promise<LmnApiProject> {
    try {
      const data = LmnApiService.getGroupFormData(formValues, username);
      const response = await this.request<LmnApiProject>(
        HttpMethods.POST,
        `${PROJECTS_LMN_API_ENDPOINT}/${formValues.name}`,
        data,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );

      this.reconcileProjectMembers(username, formValues);

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.CreateProjectFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async updateProject(lmnApiToken: string, formValues: GroupFormDto, username: string): Promise<LmnApiProject> {
    try {
      const data = LmnApiService.getGroupFormData(formValues, username);

      const response = await this.request<LmnApiProject>(
        HttpMethods.PATCH,
        `${PROJECTS_LMN_API_ENDPOINT}/${formValues.name}`,
        data,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );

      this.reconcileProjectMembers(username, formValues);

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.UpdateProjectFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async deleteProject(lmnApiToken: string, projectName: string): Promise<LmnApiProject> {
    try {
      const response = await this.request<LmnApiProject>(
        HttpMethods.DELETE,
        `${PROJECTS_LMN_API_ENDPOINT}/${projectName}`,
        undefined,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );

      void this.ldapKeycloakSyncService.reconcileNamedGroupMembers(projectName, [], []);

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.RemoveProjectFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async toggleProjectJoined(
    lmnApiToken: string,
    project: string,
    action: GroupJoinState,
    username?: string,
  ): Promise<LmnApiProject> {
    const requestUrl = `${PROJECTS_LMN_API_ENDPOINT}/${project}/${action}`;
    const config = {
      headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
    };

    try {
      const response = await this.request<LmnApiProject>(HttpMethods.POST, requestUrl, undefined, config);

      if (username) {
        const add = action === GroupJoinState.Join ? [username] : [];
        const remove = action !== GroupJoinState.Join ? [username] : [];
        void this.ldapKeycloakSyncService.updateGroupMembershipByNames(project, add, remove);
      }

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.ToggleProjectJoinedFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async togglePrinterJoined(
    lmnApiToken: string,
    printer: string,
    action: GroupJoinState,
    username?: string,
  ): Promise<LmnApiPrinter> {
    const requestUrl = `${PRINTERS_LMN_API_ENDPOINT}/${printer}/${action}`;
    const config = {
      headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
    };

    try {
      const response = await this.request<LmnApiPrinter>(HttpMethods.POST, requestUrl, undefined, config);

      if (username) {
        const add = action === GroupJoinState.Join ? [username] : [];
        const remove = action !== GroupJoinState.Join ? [username] : [];
        void this.ldapKeycloakSyncService.updateGroupMembershipByNames(printer, add, remove);
      }

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.TogglePrinterJoinedFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async getPrinters(lmnApiToken: string): Promise<LmnApiPrinter[]> {
    try {
      const response = await this.request<LmnApiPrinter[]>(HttpMethods.GET, PRINTERS_LMN_API_ENDPOINT, undefined, {
        headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
      });

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetPrintersFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async changePassword(
    lmnApiToken: string,
    username: string,
    oldPasswordEncoded: string,
    newPasswordEncoded: string,
    bypassSecurityCheck: boolean = false,
  ): Promise<null> {
    if (!bypassSecurityCheck) {
      const oldPassword = decodeBase64Api(oldPasswordEncoded);
      const currentPassword = await this.usersService.getPassword(username);

      if (oldPassword !== currentPassword) {
        throw new CustomHttpException(
          LmnApiErrorMessage.PasswordMismatch,
          HttpStatus.UNAUTHORIZED,
          undefined,
          LmnApiService.name,
        );
      }
    }

    const newPassword = decodeBase64Api(newPasswordEncoded);
    try {
      const response = await this.request<null>(
        HttpMethods.POST,
        `${USERS_LMN_API_ENDPOINT}/${username}/set-current-password`,
        {
          password: newPassword,
          set_first: false,
        },
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.PasswordChangeFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async setFirstPassword(lmnApiToken: string, username: string, passwordEncoded: string): Promise<null> {
    const password = decodeBase64Api(passwordEncoded);
    try {
      const response = await this.request<null>(
        HttpMethods.POST,
        `${USERS_LMN_API_ENDPOINT}/${username}/set-first-password`,
        {
          password,
          set_current: false,
        },
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.PasswordChangeFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async addParentToStudent(lmnApiToken: string, studentUsername: string, parentUsername: string): Promise<void> {
    try {
      await this.request<void>(
        HttpMethods.POST,
        `${USERS_LMN_API_ENDPOINT}/${studentUsername}/parents`,
        { users: [parentUsername] },
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.AddParentToStudentFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async deleteParentFromStudent(
    lmnApiToken: string,
    studentUsername: string,
    parentUsername: string,
  ): Promise<void> {
    try {
      await this.request<void>(
        HttpMethods.DELETE,
        `${USERS_LMN_API_ENDPOINT}/${studentUsername}/parents`,
        { users: [parentUsername] },
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.DeleteParentFromStudentFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async getSchools(lmnApiToken: string): Promise<string[]> {
    try {
      const response = await this.request<string[]>(HttpMethods.GET, 'schools', undefined, {
        headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
      });

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetSchoolsFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async getLmnVersion(lmnApiToken: string) {
    try {
      const response = await this.request<string[]>(HttpMethods.GET, 'server/lmnversion', undefined, {
        headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
      });

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetLmnVersionFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async getUsersByRole(
    lmnApiToken: string,
    role: string,
    school: string,
    managementList?: string,
  ): Promise<LmnUserInfo[]> {
    try {
      const schoolParam = `?${SOPHOMORIX_QUERY_PARAMS.SCHOOL}=${school}`;
      const response = await this.request<LmnUserInfo[]>(HttpMethods.GET, `roles/${role}${schoolParam}`, undefined, {
        headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
      });

      if (managementList) {
        const filename = `${managementList}.csv`;
        return response.data.filter(
          (user) => user.sophomorixAdminFile === filename || user.sophomorixAdminFile?.endsWith(`.${filename}`),
        );
      }

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetUsersByRoleFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async getManagementList(
    lmnApiToken: string,
    school: string,
    managementList: string,
  ): Promise<ListManagementEntry[]> {
    try {
      const response = await this.request<ListManagementEntry[]>(
        HttpMethods.GET,
        `${LIST_MANAGEMENT_LMN_API_ENDPOINT}/${school}/${managementList}`,
        undefined,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetManagementListFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async saveManagementList(
    lmnApiToken: string,
    school: string,
    managementList: string,
    data: ListManagementEntry[],
  ): Promise<ListManagementEntry[]> {
    try {
      const response = await this.request<ListManagementEntry[]>(
        HttpMethods.POST,
        `${LIST_MANAGEMENT_LMN_API_ENDPOINT}/${school}/${managementList}`,
        { data },
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.SaveManagementListFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async runSophomorixCheck(lmnApiToken: string): Promise<SophomorixCheckResponse> {
    try {
      const response = await this.request<SophomorixCheckResponse>(
        HttpMethods.GET,
        `${LIST_MANAGEMENT_LMN_API_ENDPOINT}/sophomorix-check`,
        undefined,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.SophomorixCheckFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async runSophomorixApply(
    lmnApiToken: string,
    school: string,
    add: boolean,
    update: boolean,
    kill: boolean,
  ): Promise<SophomorixCheckResponse> {
    try {
      const response = await this.request<SophomorixCheckResponse>(
        HttpMethods.GET,
        `${LIST_MANAGEMENT_LMN_API_ENDPOINT}/sophomorix-apply`,
        undefined,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          timeout: 120000,
          params: {
            [SOPHOMORIX_QUERY_PARAMS.SCHOOL]: school,
            ...(add && { [SOPHOMORIX_QUERY_PARAMS.ADD]: 'true' }),
            ...(update && { [SOPHOMORIX_QUERY_PARAMS.UPDATE]: 'true' }),
            ...(kill && { [SOPHOMORIX_QUERY_PARAMS.KILL]: 'true' }),
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.SophomorixApplyFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async getDevices(lmnApiToken: string, school: string): Promise<ListManagementEntry[]> {
    try {
      const response = await this.request<ListManagementEntry[]>(
        HttpMethods.GET,
        `${DEVICES_LMN_API_ENDPOINT}/list/${school}`,
        undefined,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetDevicesFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async saveDevices(
    lmnApiToken: string,
    school: string,
    data: ListManagementEntry[],
  ): Promise<ListManagementEntry[]> {
    const endpoint = `${DEVICES_LMN_API_ENDPOINT}/list/${school}`;
    const sanitized = data.map((entry) => {
      const clean: Record<string, string | null> = {};
      DEVICE_FIELDS.forEach((field) => {
        clean[field] = entry[field] ?? '';
      });
      return clean;
    });
    const payload = { data: sanitized };
    try {
      const response = await this.request<ListManagementEntry[]>(HttpMethods.POST, endpoint, payload, {
        headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Logger.error(
          `saveDevices failed: status=${error.response?.status} data=${JSON.stringify(error.response?.data)}`,
          LmnApiService.name,
        );
      } else {
        Logger.error(`saveDevices failed: ${String(error)}`, LmnApiService.name);
      }
      throw new CustomHttpException(
        LmnApiErrorMessage.SaveDevicesFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async getImportDevices(lmnApiToken: string, school: string): Promise<void> {
    try {
      await this.request<unknown>(
        HttpMethods.GET,
        `${DEVICES_LMN_API_ENDPOINT}/list/${school}/import-devices`,
        undefined,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          timeout: 120000,
        },
      );
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.ImportDevicesFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }
}

export default LmnApiService;
