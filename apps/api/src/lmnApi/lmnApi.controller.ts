import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Put, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { LMN_API_EDU_API_ENDPOINT } from '@libs/lmnApi/types/eduApiEndpoints';
import PrintPasswordsRequest from '@libs/classManagement/types/printPasswordsRequest';
import GroupForm from '@libs/groups/types/groupForm';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import LmnApiService from './lmnApi.service';

@Controller(LMN_API_EDU_API_ENDPOINT)
export class LmnApiController {
  constructor(private readonly lmnApiService: LmnApiService) {}

  @Post('passwords')
  async printPasswords(
    @Headers('x-api-key') lmnApiToken: string,
    @Body() body: { options: PrintPasswordsRequest },
    @Res() res: Response,
  ) {
    const apiResponse = await this.lmnApiService.printPasswords(lmnApiToken, body.options);
    res.setHeader(HTTP_HEADERS.ContentType, RequestResponseContentType.APPLICATION_PDF as string);
    res.setHeader(HTTP_HEADERS.ContentDisposition, apiResponse.headers['content-disposition'] as string);
    res.send(Buffer.from(apiResponse.data as ArrayBuffer));
  }

  @Put('exam-mode/:state')
  async startExamMode(
    @Param() params: { state: string },
    @Headers('x-api-key') lmnApiToken: string,
    @Body() body: { users: string[]; groupType: string; groupName: string },
  ) {
    if (params.state === 'start') {
      return this.lmnApiService.startExamMode(lmnApiToken, body.users);
    }
    return this.lmnApiService.stopExamMode(lmnApiToken, body.users, body.groupType, body.groupName);
  }

  @Post('management-groups')
  async addManagementGroup(
    @Headers('x-api-key') lmnApiToken: string,
    @Body() body: { group: string; users: string[] },
  ) {
    return this.lmnApiService.addManagementGroup(lmnApiToken, body.group, body.users);
  }

  @Delete('management-groups')
  async removeManagementGroup(
    @Headers('x-api-key') lmnApiToken: string,
    @Body() body: { group: string; users: string[] },
  ) {
    return this.lmnApiService.removeManagementGroup(lmnApiToken, body.group, body.users);
  }

  @Get('school-classes/:schoolClassName')
  async getSchoolClass(@Param() params: { schoolClassName: string }, @Headers('x-api-key') lmnApiToken: string) {
    return this.lmnApiService.getSchoolClass(lmnApiToken, params.schoolClassName);
  }

  @Get('school-classes')
  async getUserSchoolClasses(@Headers('x-api-key') lmnApiToken: string) {
    return this.lmnApiService.getUserSchoolClasses(lmnApiToken);
  }

  @Get('room')
  async getCurrentUserRoom(@Headers('x-api-key') lmnApiToken: string, @GetCurrentUsername() username: string) {
    return this.lmnApiService.getCurrentUserRoom(lmnApiToken, username);
  }

  @Get('sessions:sessionId')
  async getUserSession(
    @Headers('x-api-key') lmnApiToken: string,
    @Param() params: { sessionSid: string },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.getUserSession(lmnApiToken, params.sessionSid, username);
  }

  @Get('sessions')
  async getUserSessions(@Headers('x-api-key') lmnApiToken: string, @GetCurrentUsername() username: string) {
    return this.lmnApiService.getUserSessions(lmnApiToken, username);
  }

  @Post('sessions')
  async addUserSession(
    @Headers('x-api-key') lmnApiToken: string,
    @Body() body: { formValues: GroupForm },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.addUserSession(lmnApiToken, body.formValues, username);
  }

  @Delete('sessions:sessionId')
  async removeUserSession(
    @Headers('x-api-key') lmnApiToken: string,
    @Param() params: { sessionId: string },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.removeUserSession(lmnApiToken, params.sessionId, username);
  }

  @Patch('sessions')
  async updateUserSession(
    @Headers('x-api-key') lmnApiToken: string,
    @Body() body: { formValues: GroupForm },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.updateUserSession(lmnApiToken, body.formValues, username);
  }

  @Get('user')
  async getCurrentUser(@Headers('x-api-key') lmnApiToken: string, @GetCurrentUsername() currentUsername: string) {
    return this.lmnApiService.getUser(lmnApiToken, currentUsername);
  }

  @Get('user/:username')
  async getUser(@Headers('x-api-key') lmnApiToken: string, @Param() params: { username: string }) {
    return this.lmnApiService.getUser(lmnApiToken, params.username);
  }

  @Get('search')
  async searchUsersOrGroups(@Headers('x-api-key') lmnApiToken: string, @Query('searchQuery') searchQuery: string) {
    return this.lmnApiService.searchUsersOrGroups(lmnApiToken, searchQuery);
  }

  @Post('projects')
  async createProject(
    @Headers('x-api-key') lmnApiToken: string,
    @Body() body: { formValues: GroupForm },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.createProject(lmnApiToken, body.formValues, username);
  }

  @Patch('projects')
  async updateProject(
    @Headers('x-api-key') lmnApiToken: string,
    @Body() body: { formValues: GroupForm },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.updateProject(lmnApiToken, body.formValues, username);
  }

  @Delete('projects/:projectName')
  async deleteProject(@Headers('x-api-key') lmnApiToken: string, @Param() params: { projectName: string }) {
    return this.lmnApiService.deleteProject(lmnApiToken, params.projectName);
  }

  @Get('projects/:projectName')
  async getProject(@Headers('x-api-key') lmnApiToken: string, @Param() params: { projectName: string }) {
    return this.lmnApiService.getProject(lmnApiToken, params.projectName);
  }

  @Get('projects')
  async getUserProjects(@Headers('x-api-key') lmnApiToken: string) {
    return this.lmnApiService.getUserProjects(lmnApiToken);
  }

  @Put('password')
  async changePassword(
    @Headers('x-api-key') lmnApiToken: string,
    @Body() body: { oldPassword: string; newPassword: string },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.changePassword(lmnApiToken, username, body.oldPassword, body.newPassword);
  }
}

export default LmnApiController;
