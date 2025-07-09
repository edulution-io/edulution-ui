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
