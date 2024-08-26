import { Controller, Get, Query } from '@nestjs/common';
import GroupsService from './groups.service';
import GetToken from '../common/decorators/getToken.decorator';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  async searchGroups(@Query('groupName') groupName: string) {
    return this.groupsService.searchGroups(groupName);
  }

  @Get('user')
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async fetchCurrentUser(@GetToken() token: string) {
    return GroupsService.fetchCurrentUser(token);
  }
}

export default GroupsController;
