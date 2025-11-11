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

import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Headers,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import LMN_API_EDU_API_ENDPOINTS from '@libs/lmnApi/constants/lmnApiEduApiEndpoints';
import PrintPasswordsRequest from '@libs/classManagement/types/printPasswordsRequest';
import GroupForm from '@libs/groups/types/groupForm';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import UpdateUserDetailsDto from '@libs/userSettings/update-user-details.dto';
import GroupJoinState from '@libs/classManagement/constants/joinState.enum';
import GroupFormDto from '@libs/groups/types/groupForm.dto';
import LmnApiService from './lmnApi.service';
import GetCurrentOrganisationPrefix from '../common/decorators/getCurrentOrganisationPrefix.decorator';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import DeploymentTargetInterceptor from '../common/interceptors/deploymentTarget.interceptor';

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
    res.send(Buffer.from(apiResponse.data));
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
    @Param() params: { schoolClass: string; action: GroupJoinState },
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.toggleSchoolClassJoined(lmnApiToken, params.schoolClass, params.action, username);
  }

  @Get('room')
  async getCurrentUserRoom(@Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string, @GetCurrentUsername() username: string) {
    return this.lmnApiService.getCurrentUserRoom(lmnApiToken, username);
  }

  @Get('sessions/:sessionId')
  async getUserSession(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Param() params: { sessionId: string },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.getUserSession(lmnApiToken, params.sessionId, username);
  }

  @Get('sessions')
  async getUserSessions(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @GetCurrentUsername() username: string,
    @Query('withMemberDetails', new DefaultValuePipe(false), ParseBoolPipe) withMemberDetails: boolean,
  ) {
    return this.lmnApiService.getUserSessions(lmnApiToken, username, withMemberDetails);
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

  @UseInterceptors(DeploymentTargetInterceptor)
  @Get('search')
  async searchUsersOrGroups(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Query('searchQuery') searchQuery: string,
    @GetCurrentOrganisationPrefix() currentOrganisationPrefix: string,
  ) {
    return this.lmnApiService.searchUsersOrGroups(lmnApiToken, currentOrganisationPrefix, searchQuery);
  }

  @Post('projects')
  async createProject(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Body() body: { formValues: GroupFormDto },
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.createProject(lmnApiToken, body.formValues, username);
  }

  @Patch('projects')
  async updateProject(
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @Body() body: { formValues: GroupFormDto },
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
    @Param() params: { project: string; action: GroupJoinState },
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.toggleProjectJoined(lmnApiToken, params.project, params.action, username);
  }

  @Put('printers/:project/:action')
  async togglePrinterJoined(
    @Param() params: { project: string; action: GroupJoinState },
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
    @GetCurrentUsername() username: string,
  ) {
    return this.lmnApiService.togglePrinterJoined(lmnApiToken, params.project, params.action, username);
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

  @Get('schools')
  async getSchools(@Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string) {
    return this.lmnApiService.getSchools(lmnApiToken);
  }

  @Get('server/lmnversion')
  async getLmnVersion(@Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string) {
    return this.lmnApiService.getLmnVersion(lmnApiToken);
  }
}

export default LmnApiController;
