import { HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  EXAM_MODE_LMN_API_ENDPOINT,
  MANAGEMENT_GROUPS_LMN_API_ENDPOINT,
  PRINT_PASSWORDS_LMN_API_ENDPOINT,
  PROJECTS_LMN_API_ENDPOINT,
  QUERY_LMN_API_ENDPOINT,
  SCHOOL_CLASSES_LMN_API_ENDPOINT,
  SESSIONS_LMN_API_ENDPOINT,
  USER_ROOM_LMN_API_ENDPOINT,
  USERS_LMN_API_ENDPOINT,
} from '@libs/lmnApi/types/lmnApiEndpoints';
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
          headers: { 'x-api-key': lmnApiToken },
        }),
      );
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.PrintPasswordsFailed,
        HttpStatus.BAD_GATEWAY,
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
            headers: { 'x-api-key': lmnApiToken },
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(LmnApiErrorMessage.StartExamModeFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name);
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
            headers: { 'x-api-key': lmnApiToken },
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(LmnApiErrorMessage.StopExamModeFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name);
    }
  }

  public async removeManagementGroup(lmnApiToken: string, group: string, users: string[]): Promise<LmnApiSchoolClass> {
    try {
      const response = await this.enqueue<LmnApiSchoolClass>(() =>
        this.lmnApi.delete<LmnApiSchoolClass>(`${MANAGEMENT_GROUPS_LMN_API_ENDPOINT}/${group}/members`, {
          data: { users },
          headers: { 'x-api-key': lmnApiToken },
        }),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.RemoveManagementGroupFailed,
        HttpStatus.BAD_GATEWAY,
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
            headers: { 'x-api-key': lmnApiToken },
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.AddManagementGroupFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      );
    }
  }

  public async getSchoolClass(lmnApiToken: string, schoolClassName: string): Promise<LmnApiSchoolClass> {
    try {
      const response = await this.enqueue<LmnApiSchoolClass>(() =>
        this.lmnApi.get<LmnApiSchoolClass>(`${SCHOOL_CLASSES_LMN_API_ENDPOINT}/${schoolClassName}`, {
          headers: { 'x-api-key': lmnApiToken },
        }),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetUserSchoolClassFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      );
    }
  }

  public async getUserSchoolClasses(lmnApiToken: string): Promise<LmnApiSchoolClass[]> {
    const requestUrl = `${SCHOOL_CLASSES_LMN_API_ENDPOINT}`;
    const config = {
      headers: { 'X-API-Key': lmnApiToken },
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
        LmnApiService.name,
      );
    }
  }

  public async getUserSession(lmnApiToken: string, sessionSid: string, username: string): Promise<LmnApiSession> {
    try {
      const response = await this.enqueue<LmnApiSession>(() =>
        this.lmnApi.get<LmnApiSession>(`${SESSIONS_LMN_API_ENDPOINT}/${username}/${sessionSid}`, {
          headers: { 'x-api-key': lmnApiToken },
        }),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetUserSessionsFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      );
    }
  }

  public async addUserSession(lmnApiToken: string, formValues: GroupForm, username: string): Promise<LmnApiSession> {
    try {
      const data = { users: formValues.members };

      const response = await this.enqueue<LmnApiSession>(() =>
        this.lmnApi.post<LmnApiSession>(`${SESSIONS_LMN_API_ENDPOINT}/${username}/${formValues.name}`, data, {
          headers: { 'x-api-key': lmnApiToken },
        }),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.AddUserSessionsFailed,
        HttpStatus.BAD_GATEWAY,
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
          headers: { 'x-api-key': lmnApiToken },
        }),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.UpdateUserSessionsFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      );
    }
  }

  public async removeUserSession(lmnApiToken: string, sessionId: string, username: string): Promise<LmnApiSession> {
    try {
      const response = await this.enqueue<LmnApiSession>(() =>
        this.lmnApi.delete<LmnApiSession>(`${SESSIONS_LMN_API_ENDPOINT}/${username}/${sessionId}`, {
          headers: { 'x-api-key': lmnApiToken },
        }),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.RemoveUserSessionsFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      );
    }
  }

  public async getUserSessions(lmnApiToken: string, username: string): Promise<LmnApiSession[]> {
    try {
      const response = await this.enqueue<LmnApiSession[]>(() =>
        this.lmnApi.get<LmnApiSession[]>(`${SESSIONS_LMN_API_ENDPOINT}/${username}`, {
          headers: { 'x-api-key': lmnApiToken },
        }),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetUserSessionsFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      );
    }
  }

  public async getUser(lmnApiToken: string, username: string): Promise<UserLmnInfo> {
    try {
      const response = await this.enqueue<UserLmnInfo>(() =>
        this.lmnApi.get<UserLmnInfo>(`${USERS_LMN_API_ENDPOINT}/${username}`, {
          headers: { 'x-api-key': lmnApiToken },
        }),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(LmnApiErrorMessage.GetUserFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name);
    }
  }

  public async getCurrentUserRoom(lmnApiToken: string, username: string): Promise<UserLmnInfo> {
    try {
      const response = await this.enqueue<UserLmnInfo>(() =>
        this.lmnApi.get<UserLmnInfo>(`${USER_ROOM_LMN_API_ENDPOINT}/${username}`, {
          headers: { 'x-api-key': lmnApiToken },
        }),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetCurrentUserRoomFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      );
    }
  }

  public async searchUsersOrGroups(lmnApiToken: string, searchQuery: string): Promise<LmnApiSearchResult[]> {
    try {
      const response = await this.enqueue<LmnApiSearchResult[]>(() =>
        this.lmnApi.get<LmnApiSearchResult[]>(`${QUERY_LMN_API_ENDPOINT}/global/${searchQuery}`, {
          headers: { 'x-api-key': lmnApiToken },
        }),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.SearchUsersOrGroupsFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      );
    }
  }

  private static getProjectFromForm = (formValues: GroupForm, username: string) => ({
    admins: Array.from(new Set([...formValues.admins, username])),
    admingroups: formValues.admingroups,
    description: formValues.description,
    join: formValues.join,
    hide: formValues.hide,
    members: Array.from(new Set([...formValues.members, username])),
    membergroups: formValues.membergroups,
    proxyAddresses: [],
    school: formValues.school || DEFAULT_SCHOOL,
  });

  public async getUserProjects(lmnApiToken: string): Promise<LmnApiProject[]> {
    try {
      const response = await this.enqueue<LmnApiProject[]>(() =>
        this.lmnApi.get<LmnApiProject[]>(PROJECTS_LMN_API_ENDPOINT, {
          headers: { 'x-api-key': lmnApiToken },
        }),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetUserProjectsFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      );
    }
  }

  public async getProject(lmnApiToken: string, projectName: string): Promise<LmnApiProjectWithMembers> {
    try {
      const response = await this.enqueue<LmnApiProjectWithMembers>(() =>
        this.lmnApi.get<LmnApiProjectWithMembers>(`${PROJECTS_LMN_API_ENDPOINT}/${projectName}?all_members=true`, {
          headers: { 'x-api-key': lmnApiToken },
        }),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(LmnApiErrorMessage.GetProjectFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name);
    }
  }

  public async createProject(lmnApiToken: string, formValues: GroupForm, username: string): Promise<LmnApiProject> {
    try {
      const data = LmnApiService.getProjectFromForm(formValues, username);
      const response = await this.enqueue<LmnApiProject>(() =>
        this.lmnApi.post<LmnApiProject>(`${PROJECTS_LMN_API_ENDPOINT}/${formValues.name}`, data, {
          headers: { 'x-api-key': lmnApiToken },
        }),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(LmnApiErrorMessage.CreateProjectFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name);
    }
  }

  public async updateProject(lmnApiToken: string, formValues: GroupForm, username: string): Promise<LmnApiProject> {
    try {
      const data = LmnApiService.getProjectFromForm(formValues, username);

      const response = await this.enqueue<LmnApiProject>(() =>
        this.lmnApi.patch<LmnApiProject>(`${PROJECTS_LMN_API_ENDPOINT}/${formValues.name}`, data, {
          headers: { 'x-api-key': lmnApiToken },
        }),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(LmnApiErrorMessage.UpdateProjectFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name);
    }
  }

  public async deleteProject(lmnApiToken: string, projectName: string): Promise<LmnApiProject> {
    try {
      const response = await this.enqueue<LmnApiProject>(() =>
        this.lmnApi.delete<LmnApiProject>(`${PROJECTS_LMN_API_ENDPOINT}/${projectName}`, {
          headers: { 'x-api-key': lmnApiToken },
        }),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(LmnApiErrorMessage.RemoveProjectFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name);
    }
  }

  public async changePassword(
    lmnApiToken: string,
    username: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<null> {
    const password = await this.userService.getPassword(username);

    if (oldPassword !== password) {
      throw new CustomHttpException(LmnApiErrorMessage.PasswordMismatch, HttpStatus.UNAUTHORIZED, LmnApiService.name);
    }

    try {
      const response = await this.enqueue<null>(() =>
        this.lmnApi.post<null>(
          `${USERS_LMN_API_ENDPOINT}/${username}/set-current-password`,
          {
            password: newPassword,
            set_first: false,
          },
          {
            headers: { 'x-api-key': lmnApiToken },
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(LmnApiErrorMessage.RemoveProjectFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name);
    }
  }
}

export default LmnApiService;
