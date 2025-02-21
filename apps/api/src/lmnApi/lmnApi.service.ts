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

import { HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  EXAM_MODE_LMN_API_ENDPOINT,
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
import CustomHttpException from '@libs/error/CustomHttpException';
import LmnApiErrorMessage from '@libs/lmnApi/types/lmnApiErrorMessage';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSearchResult from '@libs/lmnApi/types/lmnApiSearchResult';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import https from 'https';
import PrintPasswordsRequest from '@libs/classManagement/types/printPasswordsRequest';
import LmnApiProjectWithMembers from '@libs/lmnApi/types/lmnApiProjectWithMembers';
import GroupForm from '@libs/groups/types/groupForm';
import DEFAULT_SCHOOL from '@libs/lmnApi/constants/defaultSchool';
import LmnApiPrinter from '@libs/lmnApi/types/lmnApiPrinter';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import UpdateUserDetailsDto from '@libs/userSettings/update-user-details.dto';
import type QuotaResponse from '@libs/lmnApi/types/lmnApiQuotas';
import UsersService from '../users/users.service';

@Injectable()
class LmnApiService {
  private lmnApiBaseUrl = process.env.LMN_API_BASE_URL as string;

  private lmnApi: AxiosInstance;

  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly userService: UsersService) {
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });
    this.lmnApi = axios.create({
      baseURL: this.lmnApiBaseUrl,
      httpsAgent,
    });
  }

  private enqueue<T>(fn: () => Promise<AxiosResponse<unknown>>): Promise<AxiosResponse<T>> {
    this.queue = this.queue
      .then(
        () =>
          new Promise<T>((resolve) => {
            setTimeout(resolve, 5);
          }),
      )
      .then(fn)
      .catch(() => Promise.resolve());

    return this.queue as Promise<AxiosResponse<T>>;
  }

  public async printPasswords(lmnApiToken: string, options: PrintPasswordsRequest): Promise<AxiosResponse> {
    try {
      return await this.enqueue<unknown>(() =>
        this.lmnApi.post<unknown>(PRINT_PASSWORDS_LMN_API_ENDPOINT, options, {
          responseType: 'arraybuffer',
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
      );
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.PrintPasswordsFailed,
        HttpStatus.BAD_GATEWAY,
        undefined,
        LmnApiService.name,
      );
    }
  }

  public async startExamMode(lmnApiToken: string, users: string[]): Promise<unknown> {
    try {
      const response = await this.enqueue(() =>
        this.lmnApi.post(
          `${EXAM_MODE_LMN_API_ENDPOINT}/start`,
          { users },
          {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          },
        ),
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
      const response = await this.enqueue(() =>
        this.lmnApi.post(
          `${EXAM_MODE_LMN_API_ENDPOINT}/stop`,
          { users, group_name: groupName, group_type: groupType },
          {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          },
        ),
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
      const response = await this.enqueue<LmnApiSchoolClass>(() =>
        this.lmnApi.delete<LmnApiSchoolClass>(`${MANAGEMENT_GROUPS_LMN_API_ENDPOINT}/${group}/members`, {
          data: { users },
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
      );
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
      const response = await this.enqueue<LmnApiSchoolClass>(() =>
        this.lmnApi.post<LmnApiSchoolClass>(
          `${MANAGEMENT_GROUPS_LMN_API_ENDPOINT}/${group}/members`,
          { users },
          {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          },
        ),
      );
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

  public async getSchoolClass(lmnApiToken: string, schoolClassName: string): Promise<LmnApiSchoolClass> {
    try {
      const response = await this.enqueue<LmnApiSchoolClass>(() =>
        this.lmnApi.get<LmnApiSchoolClass>(`${SCHOOL_CLASSES_LMN_API_ENDPOINT}/${schoolClassName}`, {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
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
      const response = await this.enqueue<LmnApiSchoolClass[]>(() =>
        this.lmnApi.get<LmnApiSchoolClass[]>(requestUrl, config),
      );
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

  public async toggleSchoolClassJoined(
    lmnApiToken: string,
    schoolClass: string,
    action: string,
  ): Promise<LmnApiSchoolClass> {
    const requestUrl = `${SCHOOL_CLASSES_LMN_API_ENDPOINT}/${schoolClass}/${action}`;

    const config = {
      headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
    };

    try {
      const response = await this.enqueue<LmnApiSchoolClass>(() =>
        this.lmnApi.post<LmnApiSchoolClass>(requestUrl, undefined, config),
      );
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

  public async getUserSession(lmnApiToken: string, sessionSid: string, username: string): Promise<LmnApiSession> {
    try {
      const response = await this.enqueue<LmnApiSession>(() =>
        this.lmnApi.get<LmnApiSession>(`${SESSIONS_LMN_API_ENDPOINT}/${username}/${sessionSid}`, {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
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

      const response = await this.enqueue<LmnApiSession>(() =>
        this.lmnApi.post<LmnApiSession>(`${SESSIONS_LMN_API_ENDPOINT}/${username}/${formValues.name}`, data, {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
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

      const response = await this.enqueue<LmnApiSession>(() =>
        this.lmnApi.post<LmnApiSession>(`${SESSIONS_LMN_API_ENDPOINT}/${username}/${formValues.name}`, data, {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
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
      const response = await this.enqueue<LmnApiSession>(() =>
        this.lmnApi.delete<LmnApiSession>(`${SESSIONS_LMN_API_ENDPOINT}/${username}/${sessionId}`, {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
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

  public async getUserSessions(lmnApiToken: string, username: string): Promise<LmnApiSession[]> {
    try {
      const response = await this.enqueue<LmnApiSession[]>(() =>
        this.lmnApi.get<LmnApiSession[]>(`${SESSIONS_LMN_API_ENDPOINT}/${username}`, {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
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

  public async getUser(lmnApiToken: string, username: string, checkFirstPassword?: boolean): Promise<UserLmnInfo> {
    try {
      const query = checkFirstPassword ? `?check_first_pw=${checkFirstPassword}` : '';
      const response = await this.enqueue<UserLmnInfo>(() =>
        this.lmnApi.get<UserLmnInfo>(`${USERS_LMN_API_ENDPOINT}/${username}${query}`, {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
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

  public async updateUser(
    lmnApiToken: string,
    userDetails: Partial<UpdateUserDetailsDto>,
    username: string,
  ): Promise<UserLmnInfo> {
    try {
      await this.enqueue<null>(() =>
        this.lmnApi.post<null>(`${USERS_LMN_API_ENDPOINT}/${username}`, userDetails, {
          headers: {
            [HTTP_HEADERS.XApiKey]: lmnApiToken,
          },
        }),
      );
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
      const response = await this.enqueue<QuotaResponse>(() =>
        this.lmnApi.get<QuotaResponse>(`${USERS_LMN_API_ENDPOINT}/${username}/${QUOTAS_LMN_API_ENDPOINT}`, {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
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

  public async getCurrentUserRoom(lmnApiToken: string, username: string): Promise<UserLmnInfo> {
    try {
      const response = await this.enqueue<UserLmnInfo>(() =>
        this.lmnApi.get<UserLmnInfo>(`${USER_ROOM_LMN_API_ENDPOINT}/${username}`, {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
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

  public async searchUsersOrGroups(lmnApiToken: string, searchQuery: string): Promise<LmnApiSearchResult[]> {
    try {
      const response = await this.enqueue<LmnApiSearchResult[]>(() =>
        this.lmnApi.get<LmnApiSearchResult[]>(`${QUERY_LMN_API_ENDPOINT}/global/${searchQuery}`, {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
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

  private static getProjectFromForm = (formValues: GroupForm, username: string) => ({
    admins: formValues.admins,
    displayName: formValues.displayName,
    admingroups: formValues.admingroups,
    description: formValues.description,
    join: formValues.join,
    hide: formValues.hide,
    members: formValues.members.filter((m) => m.value !== username),
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
      const response = await this.enqueue<LmnApiProject[]>(() =>
        this.lmnApi.get<LmnApiProject[]>(PROJECTS_LMN_API_ENDPOINT, {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
      );
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

  public async getProject(lmnApiToken: string, projectName: string): Promise<LmnApiProjectWithMembers> {
    try {
      const response = await this.enqueue<LmnApiProjectWithMembers>(() =>
        this.lmnApi.get<LmnApiProjectWithMembers>(`${PROJECTS_LMN_API_ENDPOINT}/${projectName}?all_members=true`, {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
      );
      const members = response.data.members.filter((member) => response.data.sophomorixMembers.includes(member.cn));
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

  public async createProject(lmnApiToken: string, formValues: GroupForm, username: string): Promise<LmnApiProject> {
    try {
      const data = LmnApiService.getProjectFromForm(formValues, username);
      const response = await this.enqueue<LmnApiProject>(() =>
        this.lmnApi.post<LmnApiProject>(`${PROJECTS_LMN_API_ENDPOINT}/${formValues.name}`, data, {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
      );
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

  public async updateProject(lmnApiToken: string, formValues: GroupForm, username: string): Promise<LmnApiProject> {
    try {
      const data = LmnApiService.getProjectFromForm(formValues, username);
      const response = await this.enqueue<LmnApiProject>(() =>
        this.lmnApi.patch<LmnApiProject>(`${PROJECTS_LMN_API_ENDPOINT}/${formValues.name}`, data, {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
      );
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
      const response = await this.enqueue<LmnApiProject>(() =>
        this.lmnApi.delete<LmnApiProject>(`${PROJECTS_LMN_API_ENDPOINT}/${projectName}`, {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
      );
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

  public async toggleProjectJoined(lmnApiToken: string, project: string, action: string): Promise<LmnApiProject> {
    const requestUrl = `${PROJECTS_LMN_API_ENDPOINT}/${project}/${action}`;
    const config = {
      headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
    };

    try {
      const response = await this.enqueue<LmnApiProject>(() =>
        this.lmnApi.post<LmnApiProject>(requestUrl, undefined, config),
      );
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

  public async togglePrinterJoined(lmnApiToken: string, printer: string, action: string): Promise<LmnApiPrinter> {
    const requestUrl = `${PRINTERS_LMN_API_ENDPOINT}/${printer}/${action}`;
    const config = {
      headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
    };

    try {
      const response = await this.enqueue<LmnApiPrinter>(() =>
        this.lmnApi.post<LmnApiPrinter>(requestUrl, undefined, config),
      );
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
      const response = await this.enqueue<LmnApiPrinter[]>(() =>
        this.lmnApi.get<LmnApiPrinter[]>(PRINTERS_LMN_API_ENDPOINT, {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        }),
      );
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
      const oldPassword = atob(oldPasswordEncoded);
      const currentPassword = await this.userService.getPassword(username);

      if (oldPassword !== currentPassword) {
        throw new CustomHttpException(
          LmnApiErrorMessage.PasswordMismatch,
          HttpStatus.UNAUTHORIZED,
          undefined,
          LmnApiService.name,
        );
      }
    }

    const newPassword = atob(newPasswordEncoded);
    try {
      const response = await this.enqueue<null>(() =>
        this.lmnApi.post<null>(
          `${USERS_LMN_API_ENDPOINT}/${username}/set-current-password`,
          {
            password: newPassword,
            set_first: false,
          },
          {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          },
        ),
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
    const password = atob(passwordEncoded);
    try {
      const response = await this.enqueue<null>(() =>
        this.lmnApi.post<null>(
          `${USERS_LMN_API_ENDPOINT}/${username}/set-first-password`,
          {
            password,
            set_current: false,
          },
          {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          },
        ),
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
}

export default LmnApiService;
