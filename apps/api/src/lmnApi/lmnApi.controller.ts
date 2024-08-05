import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { LMN_API_EDU_API_ENDPOINT } from '@libs/lmnApi/types/eduApiEndpoints';
import PrintPasswordsRequest from '@libs/classManagement/types/printPasswordsRequest';
import GroupForm from '@libs/groups/types/groupForm';
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
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', apiResponse.headers['content-disposition'] as string);
    res.send(Buffer.from(apiResponse.data as ArrayBuffer));
  }

  @Post('examMode/:state')
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

  @Post('managementGroups')
  async addManagementGroup(
    @Headers('x-api-key') lmnApiToken: string,
    @Body() body: { group: string; users: string[] },
  ) {
    return this.lmnApiService.addManagementGroup(lmnApiToken, body.group, body.users);
  }

  @Delete('managementGroups')
  async removeManagementGroup(
    @Headers('x-api-key') lmnApiToken: string,
    @Body() body: { group: string; users: string[] },
  ) {
    return this.lmnApiService.removeManagementGroup(lmnApiToken, body.group, body.users);
  }

  @Get('schoolClasses/:schoolClassName')
  async getSchoolClass(@Param() params: { schoolClassName: string }, @Headers('x-api-key') lmnApiToken: string) {
    return this.lmnApiService.getSchoolClass(lmnApiToken, params.schoolClassName);
  }

  @Get('schoolClasses')
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
    @Body() body: { sessionSid: string },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.getUserSession(lmnApiToken, body.sessionSid, username);
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

  @Get('sessions')
  async getUserSessions(@Headers('x-api-key') lmnApiToken: string, @GetCurrentUsername() username: string) {
    return this.lmnApiService.getUserSessions(lmnApiToken, username);
  }

  @Get('user')
  async getCurrentUser(@Headers('x-api-key') lmnApiToken: string, @GetCurrentUsername() currentUsername: string) {
    return this.lmnApiService.getUser(lmnApiToken, currentUsername);
  }

  @Get('user/:username')
  async getUser(@Headers('x-api-key') lmnApiToken: string, @Param() params: { username: string }) {
    return this.lmnApiService.getUser(lmnApiToken, params.username);
  }

  @Get('search/:searchQuery')
  async searchUsersOrGroups(@Headers('x-api-key') lmnApiToken: string, @Param() params: { searchQuery: string }) {
    return this.lmnApiService.searchUsersOrGroups(lmnApiToken, params.searchQuery);
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
  async removeProject(@Headers('x-api-key') lmnApiToken: string, @Param() params: { projectName: string }) {
    return this.lmnApiService.removeProject(lmnApiToken, params.projectName);
  }

  @Get('projects/:projectName')
  async getProject(@Headers('x-api-key') lmnApiToken: string, @Param() params: { projectName: string }) {
    return this.lmnApiService.getProject(lmnApiToken, params.projectName);
  }

  @Get('projects')
  async getUserProjects(@Headers('x-api-key') lmnApiToken: string) {
    return this.lmnApiService.getUserProjects(lmnApiToken);
  }
}

export default LmnApiController;
