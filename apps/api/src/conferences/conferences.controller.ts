import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Sse,
  MessageEvent,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Observable, Subject, map } from 'rxjs';
import { CONFERENCES_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import ConferencesService from './conferences.service';
import { Conference } from './conference.schema';
import GetCurrentUser from '../common/decorators/getUser.decorator';
import JWTUser from '../types/JWTUser';
import TokenService from '../common/services/token.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags(CONFERENCES_EDU_API_ENDPOINT)
@ApiBearerAuth()
@Controller(CONFERENCES_EDU_API_ENDPOINT)
class ConferencesController {
  private conferenceCreated$ = new Subject<MessageEvent>();

  constructor(
    private readonly conferencesService: ConferencesService,
    private readonly tokenService: TokenService,
  ) {}

  @Post()
  create(@Body() createConferenceDto: CreateConferenceDto, @GetCurrentUser() user: JWTUser) {
    const conference = this.conferencesService.create(createConferenceDto, user);

    this.conferenceCreated$.next({
      data: {
        message: 'Conference created',
      },
    });

    return conference;
  }

  @Get('join/:meetingID')
  join(@Param('meetingID') meetingID: string, @GetCurrentUser() user: JWTUser) {
    return this.conferencesService.join(meetingID, user);
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
  async toggleIsRunning(@Body() conference: Pick<Conference, 'meetingID'>, @GetCurrentUser() user: JWTUser) {
    await this.conferencesService.toggleConferenceIsRunning(conference.meetingID, user.preferred_username);
    return this.conferencesService.findAllConferencesTheUserHasAccessTo(user);
  }

  @Delete()
  async remove(@Body() meetingIDs: string[], @GetCurrentUser() user: JWTUser) {
    await this.conferencesService.remove(meetingIDs, user.preferred_username);

    this.conferenceCreated$.next({
      data: {
        message: 'Conference deleted',
      },
    });

    return this.conferencesService.findAllConferencesTheUserHasAccessTo(user);
  }

  @Public()
  @Sse('sse')
  async sse(@Query('token') token: string): Promise<Observable<MessageEvent>> {
    const user = await this.tokenService.getCurrentUser(token);
    if (user) {
      return this.conferenceCreated$.asObservable().pipe(map((event) => ({ data: event.data }) as MessageEvent));
    }
    throw new UnauthorizedException('User not found in JWT');
  }
}

export default ConferencesController;
