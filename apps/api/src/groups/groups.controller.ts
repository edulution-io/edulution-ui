import { Controller, Get, Param } from '@nestjs/common';
import GroupsService from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  async getGroups() {
    return await this.groupsService.searchGroups();
  }

  @Get('search/:searchString')
  async searchGroups(@Param('searchString') searchString: string) {
    return await this.groupsService.searchGroups(searchString);
  }
}

export default GroupsController;
