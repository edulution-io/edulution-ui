import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import ConferencesService from './conferences.service';
import CreateConferenceDto from './dto/create-conference.dto';
import mockedConferences from './dto/mockedConferences';
import { Conference } from './conference.schema';
import GetCurrentUser, { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import JWTUser from '../types/JWTUser';

@Controller('conferences')
class ConferencesController {
  constructor(private readonly conferencesService: ConferencesService) {}

  @Post()
  create(@Body() createConferenceDto: CreateConferenceDto, @GetCurrentUser() user: JWTUser) {
    return this.conferencesService.create(createConferenceDto, user);
  }

  @Get('join/:meetingID')
  join(@Param('meetingID') meetingID: string, @GetCurrentUser() user: JWTUser) {
    return this.conferencesService.join(meetingID, user);
  }

  @Get()
  findAll(@GetCurrentUsername() username: string) {
    try {
      return this.conferencesService.findAllConferencesTheUserHasAccessTo(username);
    } catch (e) {
      return mockedConferences;
    }
  }

  @Patch()
  async update(@Body() conference: Conference, @GetCurrentUsername() username: string) {
    await this.conferencesService.isCurrentUserTheCreator(conference.meetingID, username);
    await this.conferencesService.update(conference);
    return this.conferencesService.findAllConferencesTheUserHasAccessTo(username);
  }

  @Put()
  async toggleIsRunning(@Body() conference: Pick<Conference, 'meetingID'>, @GetCurrentUsername() username: string) {
    await this.conferencesService.toggleConferenceIsRunning(conference.meetingID, username);
    return this.conferencesService.findAllConferencesTheUserHasAccessTo(username);
  }

  @Delete()
  async remove(@Body() meetingIDs: string[], @GetCurrentUsername() username: string) {
    await this.conferencesService.remove(meetingIDs, username);
    return this.conferencesService.findAllConferencesTheUserHasAccessTo(username);
  }
}

export default ConferencesController;
