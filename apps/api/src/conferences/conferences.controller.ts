import { Body, Controller, Delete, Get, MessageEvent, Param, Patch, Post, Put, Query, Res, Sse } from '@nestjs/common';
import CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { Response } from 'express';
import { CONFERENCES_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import JoinPublicConferenceDetails from '@libs/conferences/types/joinPublicConferenceDetails';
import ConferencesService from './conferences.service';
import { Conference } from './conference.schema';
import GetCurrentUser, { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import { Public } from '../common/decorators/public.decorator';

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

  @Sse('sse')
  sse(@GetCurrentUsername() username: string, @Res() res: Response): Observable<MessageEvent> {
    return this.conferencesService.subscribe(username, res);
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

  @Public()
  @Sse('sse/public')
  publicSse(@Query('meetingID') meetingID: string, @Res() res: Response): Observable<MessageEvent> {
    return this.conferencesService.subscribe(meetingID, res);
  }
}

export default ConferencesController;
