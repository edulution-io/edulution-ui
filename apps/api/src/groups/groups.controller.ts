import { Controller, Get, Param } from '@nestjs/common';
import GroupsService from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  async getGroups() {
    return this.groupsService.searchGroups();
  }

  @Get('search/:searchString')
  async searchGroups(@Param('searchString') searchString: string) {
    return this.groupsService.searchGroups(searchString);
  }
}

export default GroupsController;
