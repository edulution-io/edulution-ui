import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import ConferencesService from './conferences.service';
import CreateConferenceDto from './dto/create-conference.dto';
import { Conference } from './conference.schema';
import { GetUsername } from '../auth/getUser';

@Controller('conferences')
class ConferencesController {
  constructor(private readonly conferencesService: ConferencesService) {}

  @Post()
  create(@Body() createConferenceDto: CreateConferenceDto, @GetUsername() username: string) {
    return this.conferencesService.create(createConferenceDto, username);
  }

  @Get()
  findAll(@GetUsername() username: string) {
    return this.conferencesService.findAll(username);
  }

  @Patch()
  async update(@Body() conference: Conference, @GetUsername() username: string) {
    await this.conferencesService.update(conference);
    return this.conferencesService.findAll(username);
  }

  @Delete()
  async remove(@Body() meetingIDs: string[], @GetUsername() username: string) {
    await this.conferencesService.remove(meetingIDs);
    return this.conferencesService.findAll(username);
  }
}

export default ConferencesController;
