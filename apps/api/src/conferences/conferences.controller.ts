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

import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CONFERENCES_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import JoinPublicConferenceDetails from '@libs/conferences/types/joinPublicConferenceDetails';
import ConferencesService from './conferences.service';
import { Conference } from './conference.schema';
import { Public } from '../common/decorators/public.decorator';
import GetCurrentUser from '../common/decorators/getCurrentUser.decorator';

@ApiTags(CONFERENCES_EDU_API_ENDPOINT)
@ApiBearerAuth()
@Controller(CONFERENCES_EDU_API_ENDPOINT)
class ConferencesController {
  constructor(private readonly conferencesService: ConferencesService) {}

  @Post()
  create(@Body() createConferenceDto: CreateConferenceDto, @GetCurrentUser() user: JWTUser) {
    return this.conferencesService.create(createConferenceDto, user);
  }

  @Get('join/:meetingID')
  join(@Param('meetingID') meetingID: string, @Query('password') password: string, @GetCurrentUser() user: JWTUser) {
    return this.conferencesService.join(meetingID, user, password);
  }

  @Get()
  findAll(@GetCurrentUser() user: JWTUser) {
    return this.conferencesService.findAllConferencesTheUserHasAccessTo(user);
  }

  @Patch()
  async update(@Body() conference: Conference, @GetCurrentUser() user: JWTUser) {
    await this.conferencesService.isCurrentUserTheCreator(conference.meetingID, user.preferred_username);
    await this.conferencesService.update(conference);
    return this.conferencesService.findAllConferencesTheUserHasAccessTo(user);
  }

  @Put()
  async toggleIsRunning(
    @Body() conference: Pick<Conference, 'meetingID' | 'isRunning'>,
    @GetCurrentUser() user: JWTUser,
  ) {
    return this.conferencesService.toggleConferenceIsRunning(
      conference.meetingID,
      conference.isRunning,
      user.preferred_username,
    );
  }

  @Delete()
  async remove(@Body() meetingIDs: string[], @GetCurrentUser() user: JWTUser) {
    await this.conferencesService.remove(meetingIDs, user.preferred_username);
    return this.conferencesService.findAllConferencesTheUserHasAccessTo(user);
  }

  @Public()
  @Get('public/:meetingID')
  getPublicConference(@Param('meetingID') meetingID: string) {
    return this.conferencesService.findPublicConference(meetingID);
  }

  @Public()
  @Post('public')
  joinPublicConference(@Body() joinDetails: JoinPublicConferenceDetails) {
    return this.conferencesService.joinPublicConference(joinDetails);
  }
}

export default ConferencesController;
