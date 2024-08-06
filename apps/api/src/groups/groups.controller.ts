import { Controller, Get, Query } from '@nestjs/common';
import GroupsService from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  async searchGroups(@Query('groupName') groupName: string) {
    return this.groupsService.searchGroups(groupName);
  }
}

export default GroupsController;
