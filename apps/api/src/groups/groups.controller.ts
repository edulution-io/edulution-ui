import { Controller, Get, Query } from '@nestjs/common';
import { EDU_API_GROUPS_ENDPOINT } from '@libs/groups/constants/eduApiEndpoints';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import GroupsService from './groups.service';
import GetToken from '../common/decorators/getToken.decorator';

@ApiTags(EDU_API_GROUPS_ENDPOINT)
@ApiBearerAuth()
@Controller(EDU_API_GROUPS_ENDPOINT)
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
