import { HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import Session from '@libs/classManagement/types/session';
import {
  EXAM_MODE_LMN_API_ENDPOINT,
  MANAGEMENT_GROUPS_LMN_API_ENDPOINT,
  PROJECTS_LMN_API_ENDPOINT,
  QUERY_LMN_API_ENDPOINT,
  SCHOOL_CLASSES_LMN_API_ENDPOINT,
  SESSIONS_LMN_API_ENDPOINT,
  USERS_LMN_API_ENDPOINT,
} from '@libs/lmnApi/types/lmnApiEndpoints';
import CustomHttpException from '@libs/error/CustomHttpException';
import LmnApiErrorMessage from '@libs/lmnApi/types/lmnApiErrorMessage';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import GroupDto from '@libs/groups/types/group.dto';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSearchResult from '@libs/lmnApi/types/lmnApiSearchResult';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';

@Injectable()
class LmnApiService {
  private lmnApiBaseUrl = process.env.LMN_API_BASE_URL as string;
  private lmnApi: AxiosInstance;

  constructor() {
    this.lmnApi = axios.create({
      baseURL: this.lmnApiBaseUrl,
    });
  }

  public async startExamMode(lmnApiToken: string, users: string[]): Promise<unknown> {
    try {
      const response = await this.lmnApi.post(
        `${EXAM_MODE_LMN_API_ENDPOINT}/start`,
        { users },
        {
          headers: { 'x-api-key': lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      console.log(`error ${JSON.stringify(error, null, 2)}`);
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
      const response = await this.lmnApi.post(
        `${EXAM_MODE_LMN_API_ENDPOINT}/stop`,
        { users, group_name: groupName, group_type: groupType },
        {
          headers: { 'x-api-key': lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      console.log(`error ${JSON.stringify(error, null, 2)}`);
      throw new CustomHttpException(LmnApiErrorMessage.StopExamModeFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name);
    }
  }

  public async removeManagementGroup(lmnApiToken: string, group: string, users: string[]): Promise<LmnApiSchoolClass> {
    try {
      const response = await this.lmnApi.delete<LmnApiSchoolClass>(
        `${MANAGEMENT_GROUPS_LMN_API_ENDPOINT}/${group}/members`,
        {
          data: { users },
          headers: { 'x-api-key': lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      console.log(`error ${JSON.stringify(error, null, 2)}`);
      throw new CustomHttpException(
        LmnApiErrorMessage.RemoveManagementGroupFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      );
    }
  }

  public async addManagementGroup(lmnApiToken: string, group: string, users: string[]): Promise<LmnApiSchoolClass> {
    try {
      const response = await this.lmnApi.post<LmnApiSchoolClass>(
        `${MANAGEMENT_GROUPS_LMN_API_ENDPOINT}/${group}/members`,
        { users },
        {
          headers: { 'x-api-key': lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      console.log(`error ${JSON.stringify(error, null, 2)}`);
      throw new CustomHttpException(
        LmnApiErrorMessage.AddManagementGroupFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      );
    }
  }

  public async getSchoolClass(lmnApiToken: string, schoolClassName: string): Promise<LmnApiSchoolClass> {
    try {
      const response = await this.lmnApi.get<LmnApiSchoolClass>(
        `${SCHOOL_CLASSES_LMN_API_ENDPOINT}/${schoolClassName}`,
        {
          headers: { 'x-api-key': lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      console.log(`error ${JSON.stringify(error, null, 2)}`);
      throw new CustomHttpException(
        LmnApiErrorMessage.GetUserSchoolClassesFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      );
    }
  }

  public async getUserSchoolClasses(lmnApiToken: string): Promise<LmnApiSchoolClass[]> {
    try {
      const response = await this.lmnApi.get<LmnApiSchoolClass[]>(`${SCHOOL_CLASSES_LMN_API_ENDPOINT}`, {
        headers: { 'x-api-key': lmnApiToken },
      });
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetUserSchoolClassesFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      );
    }
  }

  public async getUserProjects(lmnApiToken: string): Promise<LmnApiProject[]> {
    try {
      const response = await this.lmnApi.get<LmnApiProject[]>(PROJECTS_LMN_API_ENDPOINT, {
        headers: { 'x-api-key': lmnApiToken },
      });
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.GetUserProjectsFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      );
    }
  }

  public async getProject(lmnApiToken: string, projectName: string): Promise<LmnApiProject[]> {
    try {
      const response = await this.lmnApi.get<LmnApiProject[]>(`${PROJECTS_LMN_API_ENDPOINT}/${projectName}`, {
        headers: { 'x-api-key': lmnApiToken },
      });
      return response.data;
    } catch (error) {
      console.log(`error ${JSON.stringify(error, null, 2)}`);
      throw new CustomHttpException(LmnApiErrorMessage.GetProjectFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name);
    }
  }

  public async getUserSession(lmnApiToken: string, sessionSid: string, username: string): Promise<Session> {
    try {
      const response = await this.lmnApi.get<Session>(`${SESSIONS_LMN_API_ENDPOINT}/${username}/${sessionSid}`, {
        headers: { 'x-api-key': lmnApiToken },
      });
      return response.data;
    } catch (error) {
      console.log(`error ${JSON.stringify(error, null, 2)}`);
      throw new CustomHttpException(
        LmnApiErrorMessage.GetUserSessionsFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      );
    }
  }

  public async getUserSessions(lmnApiToken: string, username: string): Promise<LmnApiSession[]> {
    try {
      const response = await this.lmnApi.get<LmnApiSession[]>(`${SESSIONS_LMN_API_ENDPOINT}/${username}`, {
        headers: { 'x-api-key': lmnApiToken },
      });
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
      const response = await this.lmnApi.get<UserLmnInfo>(`${USERS_LMN_API_ENDPOINT}/${username}`, {
        headers: { 'x-api-key': lmnApiToken },
      });
      return response.data;
    } catch (error) {
      console.log(`error ${JSON.stringify(error, null, 2)}`);
      throw new CustomHttpException(LmnApiErrorMessage.GetUserFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name);
    }
  }

  public async searchUsersOrGroups(lmnApiToken: string, searchQuery: string): Promise<LmnApiSearchResult[]> {
    try {
      const response = await this.lmnApi.get<LmnApiSearchResult[]>(`${QUERY_LMN_API_ENDPOINT}/global/${searchQuery}`, {
        headers: { 'x-api-key': lmnApiToken },
      });
      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        LmnApiErrorMessage.SearchUsersOrGroupsFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      );
    }
  }

  public async createProject(lmnApiToken: string, username: string, project: GroupDto): Promise<GroupDto> {
    try {
      console.log(`username ${JSON.stringify(username, null, 2)}`);
      const response = await this.lmnApi.post<GroupDto>(
        `${PROJECTS_LMN_API_ENDPOINT}/${project.name}`,
        { ...project },
        {
          headers: { 'x-api-key': lmnApiToken },
        },
      );
      return response.data;
    } catch (error) {
      throw new CustomHttpException(LmnApiErrorMessage.CreateProjectFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name);
    }
  }
}

export default LmnApiService;
