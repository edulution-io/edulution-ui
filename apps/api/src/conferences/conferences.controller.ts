import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import UpdateConferenceDto from './dto/update-conference.dto';
import ConferencesService from './conferences.service';
import CreateConferenceDto from './dto/create-conference.dto';

@Controller('conferences')
class ConferencesController {
  constructor(private readonly conferencesService: ConferencesService) {}

  @Post()
  create(@Body() createConferenceDto: CreateConferenceDto) {
    return this.conferencesService.create(createConferenceDto);
  }

  @Get()
  findAll() {
    return this.conferencesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conferencesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConferenceDto: UpdateConferenceDto) {
    return this.conferencesService.update(id, updateConferenceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conferencesService.remove(id);
  }
}

export default ConferencesController;
