import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { LMN_API_EDU_API_ENDPOINT } from '@libs/lmnApi/types/eduApiEndpoints';
import PrintPasswordsRequest from '@libs/classManagement/types/printPasswordsRequest';
import GroupForm from '@libs/groups/types/groupForm';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import LmnApiService from './lmnApi.service';

@Controller(LMN_API_EDU_API_ENDPOINT)
export class LmnApiController {
  constructor(private readonly lmnApiService: LmnApiService) {}

  @Post('passwords/print')
  async printPasswords(@Body() body: { lmnApiToken: string; options: PrintPasswordsRequest }, @Res() res: Response) {
    const apiResponse = await this.lmnApiService.printPasswords(body.lmnApiToken, body.options);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', apiResponse.headers['content-disposition'] as string);
    res.send(Buffer.from(apiResponse.data as ArrayBuffer));
  }

  @Post('examMode/start')
  async startExamMode(@Body() body: { lmnApiToken: string; users: string[] }) {
    return this.lmnApiService.startExamMode(body.lmnApiToken, body.users);
  }

  @Post('examMode/stop')
  async stopExamMode(@Body() body: { lmnApiToken: string; users: string[]; groupType: string; groupName: string }) {
    return this.lmnApiService.stopExamMode(body.lmnApiToken, body.users, body.groupType, body.groupName);
  }

  @Post('managementGroup/add')
  async addManagementGroup(@Body() body: { lmnApiToken: string; group: string; users: string[] }) {
    return this.lmnApiService.addManagementGroup(body.lmnApiToken, body.group, body.users);
  }

  @Post('managementGroup/remove')
  async removeManagementGroup(@Body() body: { lmnApiToken: string; group: string; users: string[] }) {
    return this.lmnApiService.removeManagementGroup(body.lmnApiToken, body.group, body.users);
  }

  @Post('schoolClass/user')
  async getSchoolClass(@Body() body: { lmnApiToken: string; schoolClassName: string }) {
    return this.lmnApiService.getSchoolClass(body.lmnApiToken, body.schoolClassName);
  }

  @Post('room')
  async getCurrentUserRoom(@Body() body: { lmnApiToken: string }, @GetCurrentUsername() username: string) {
    return this.lmnApiService.getCurrentUserRoom(body.lmnApiToken, username);
  }

  @Post('session/user')
  async getUserSession(
    @Body() body: { lmnApiToken: string; sessionSid: string },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.getUserSession(body.lmnApiToken, body.sessionSid, username);
  }

  @Post('session/user/add')
  async addUserSession(
    @Body() body: { lmnApiToken: string; formValues: GroupForm },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.addUserSession(body.lmnApiToken, body.formValues, username);
  }

  @Post('session/user/remove')
  async removeUserSession(
    @Body() body: { lmnApiToken: string; sessionId: string },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.removeUserSession(body.lmnApiToken, body.sessionId, username);
  }

  @Post('session/user/update')
  async updateUserSession(
    @Body() body: { lmnApiToken: string; formValues: GroupForm },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.updateUserSession(body.lmnApiToken, body.formValues, username);
  }

  @Post('user')
  async getUser(@Body() body: { lmnApiToken: string; username?: string }, @GetCurrentUsername() username: string) {
    return this.lmnApiService.getUser(body.lmnApiToken, body.username || username);
  }

  @Post('user/sessions')
  async getUserSessions(@Body() body: { lmnApiToken: string }, @GetCurrentUsername() username: string) {
    return this.lmnApiService.getUserSessions(body.lmnApiToken, username);
  }

  @Post('user/projects')
  async getUserProjects(@Body() body: { lmnApiToken: string }) {
    return this.lmnApiService.getUserProjects(body.lmnApiToken);
  }

  @Post('user/schoolClasses')
  async getUserSchoolClasses(@Body() body: { lmnApiToken: string }) {
    return this.lmnApiService.getUserSchoolClasses(body.lmnApiToken);
  }

  @Post('search')
  async searchUsersOrGroups(@Body() body: { lmnApiToken: string; searchQuery: string }) {
    return this.lmnApiService.searchUsersOrGroups(body.lmnApiToken, body.searchQuery);
  }

  @Post('project/create')
  async createProject(
    @Body() body: { lmnApiToken: string; formValues: GroupForm },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.createProject(body.lmnApiToken, body.formValues, username);
  }

  @Post('project/update')
  async updateProject(
    @Body() body: { lmnApiToken: string; formValues: GroupForm },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.updateProject(body.lmnApiToken, body.formValues, username);
  }

  @Post('project/remove')
  async removeProject(@Body() body: { lmnApiToken: string; projectName: string }) {
    return this.lmnApiService.removeProject(body.lmnApiToken, body.projectName);
  }

  @Post('project')
  async getProject(@Body() body: { lmnApiToken: string; projectName: string }) {
    return this.lmnApiService.getProject(body.lmnApiToken, body.projectName);
  }
}

export default LmnApiController;
