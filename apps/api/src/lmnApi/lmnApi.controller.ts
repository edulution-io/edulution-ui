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

import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Put, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import LMN_API_EDU_API_ENDPOINTS from '@libs/lmnApi/constants/eduApiEndpoints';
import PrintPasswordsRequest from '@libs/classManagement/types/printPasswordsRequest';
import GroupForm from '@libs/groups/types/groupForm';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import UpdateUserDetailsDto from '@libs/userSettings/update-user-details.dto';
import LmnApiService from './lmnApi.service';
import GetCurrentOrganisationPrefix from '../common/decorators/getCurrentOrganisationPrefix.decorator';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';

const { ROOT, USERS_QUOTA } = LMN_API_EDU_API_ENDPOINTS;

@ApiTags(ROOT)
@ApiBearerAuth()
@Controller(ROOT)
export class LmnApiController {
  constructor(private readonly lmnApiService: LmnApiService) {}

  @Post('passwords')
  async printPasswords(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
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
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Body() body: { users: string[]; groupType: string; groupName: string },
  ) {
    if (params.state === 'start') {
      return this.lmnApiService.startExamMode(lmnApiToken, body.users);
    }
    return this.lmnApiService.stopExamMode(lmnApiToken, body.users, body.groupType, body.groupName);
  }

  @Post('management-groups')
  async addManagementGroup(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Body() body: { group: string; users: string[] },
  ) {
    return this.lmnApiService.addManagementGroup(lmnApiToken, body.group, body.users);
  }

  @Delete('management-groups')
  async removeManagementGroup(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Body() body: { group: string; users: string[] },
  ) {
    return this.lmnApiService.removeManagementGroup(lmnApiToken, body.group, body.users);
  }

  @Get('school-classes/:schoolClassName')
  async getSchoolClass(
    @Param() params: { schoolClassName: string },
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
  ) {
    return this.lmnApiService.getSchoolClass(lmnApiToken, params.schoolClassName);
  }

  @Get('school-classes')
  async getUserSchoolClasses(@Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string) {
    return this.lmnApiService.getUserSchoolClasses(lmnApiToken);
  }

  @Put('school-classes/:schoolClass/:action')
  async toggleSchoolClassJoined(
    @Param() params: { schoolClass: string; action: string },
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
  ) {
    return this.lmnApiService.toggleSchoolClassJoined(lmnApiToken, params.schoolClass, params.action);
  }

  @Get('room')
  async getCurrentUserRoom(@Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string, @GetCurrentUsername() username: string) {
    return this.lmnApiService.getCurrentUserRoom(lmnApiToken, username);
  }

  @Get('sessions/:sessionId')
  async getUserSession(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Param() params: { sessionSid: string },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.getUserSession(lmnApiToken, params.sessionSid, username);
  }

  @Get('sessions')
  async getUserSessions(@Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string, @GetCurrentUsername() username: string) {
    return this.lmnApiService.getUserSessions(lmnApiToken, username);
  }

  @Post('sessions')
  async addUserSession(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Body() body: { formValues: GroupForm },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.addUserSession(lmnApiToken, body.formValues, username);
  }

  @Delete('sessions/:sessionId')
  async removeUserSession(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Param() params: { sessionId: string },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.removeUserSession(lmnApiToken, params.sessionId, username);
  }

  @Patch('sessions')
  async updateUserSession(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Body() body: { formValues: GroupForm },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.updateUserSession(lmnApiToken, body.formValues, username);
  }

  @Get('user')
  async getCurrentUser(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @GetCurrentUsername() currentUsername: string,
  ) {
    return this.lmnApiService.getUser(lmnApiToken, currentUsername);
  }

  @Get('user/:username')
  async getUser(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Param() params: { username: string },
    @Query('checkFirstPassword') checkFirstPassword?: boolean,
  ) {
    return this.lmnApiService.getUser(lmnApiToken, params.username, checkFirstPassword);
  }

  @Patch('user')
  async updateCurrentUserDetails(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Body() body: { userDetails: Partial<UpdateUserDetailsDto> },
    @GetCurrentUsername() currentUsername: string,
  ) {
    return this.lmnApiService.updateUser(lmnApiToken, body.userDetails, currentUsername);
  }

  @Get(`user/:username/${USERS_QUOTA}`)
  async getUsersQuota(@Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string, @Param() params: { username: string }) {
    return this.lmnApiService.getUsersQuota(lmnApiToken, params.username);
  }

  @Get('search')
  async searchUsersOrGroups(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Query('searchQuery') searchQuery: string,
    @GetCurrentOrganisationPrefix() school: string,
  ) {
    return this.lmnApiService.searchUsersOrGroups(lmnApiToken, school, searchQuery);
  }

  @Post('projects')
  async createProject(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Body() body: { formValues: GroupForm },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.createProject(lmnApiToken, body.formValues, username);
  }

  @Patch('projects')
  async updateProject(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Body() body: { formValues: GroupForm },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.updateProject(lmnApiToken, body.formValues, username);
  }

  @Delete('projects/:projectName')
  async deleteProject(@Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string, @Param() params: { projectName: string }) {
    return this.lmnApiService.deleteProject(lmnApiToken, params.projectName);
  }

  @Get('projects/:projectName')
  async getProject(@Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string, @Param() params: { projectName: string }) {
    return this.lmnApiService.getProject(lmnApiToken, params.projectName);
  }

  @Get('projects')
  async getUserProjects(@Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string) {
    return this.lmnApiService.getUserProjects(lmnApiToken);
  }

  @Put('projects/:project/:action')
  async toggleProjectJoined(
    @Param() params: { project: string; action: string },
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
  ) {
    return this.lmnApiService.toggleProjectJoined(lmnApiToken, params.project, params.action);
  }

  @Put('printers/:project/:action')
  async togglePrinterJoined(
    @Param() params: { project: string; action: string },
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
  ) {
    return this.lmnApiService.togglePrinterJoined(lmnApiToken, params.project, params.action);
  }

  @Get('printers')
  async getPrinters(@Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string) {
    return this.lmnApiService.getPrinters(lmnApiToken);
  }

  @Put('password')
  async changePassword(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Body() body: { oldPassword: string; newPassword: string },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.changePassword(lmnApiToken, username, body.oldPassword, body.newPassword);
  }

  @Post('password')
  async setPassword(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Body() body: { password: string; username: string },
  ) {
    return this.lmnApiService.changePassword(lmnApiToken, body.username, '', body.password, true);
  }

  @Put('first-password')
  async setFirstPassword(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Body() body: { password: string; username: string },
  ) {
    return this.lmnApiService.setFirstPassword(lmnApiToken, body.username, body.password);
  }
}

export default LmnApiController;
