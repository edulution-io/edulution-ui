import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import ConferencesService from './conferences.service';
import CreateConferenceDto from './dto/create-conference.dto';
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
    return this.conferencesService.findAll(username);
  }

  @Patch()
  async update(@Body() conference: Conference, @GetCurrentUsername() username: string) {
    await this.conferencesService.update(conference, username);
    return this.conferencesService.findAll(username);
  }

  @Put()
  async toggleIsRunning(@Body() conference: Pick<Conference, 'meetingID'>, @GetCurrentUsername() username: string) {
    await this.conferencesService.toggleConferenceIsRunning(conference.meetingID, username);
    return this.conferencesService.findAll(username);
  }

  @Delete()
  async remove(@Body() meetingIDs: string[], @GetCurrentUsername() username: string) {
    await this.conferencesService.remove(meetingIDs, username);
    return this.conferencesService.findAll(username);
  }
}

export default ConferencesController;
