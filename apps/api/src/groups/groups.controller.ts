import { Controller, Get, Param } from '@nestjs/common';
import GetTokenDecorator from '../common/decorators/getToken.decorator';
import GroupsService from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  async getGroups(@GetTokenDecorator() token: string) {
    return this.groupsService.searchGroups(token);
  }

  @Get(':searchString')
  async searchGroups(@GetTokenDecorator() token: string, @Param('searchString') searchString: string) {
    return this.groupsService.searchGroups(token, searchString);
  }
}

export default GroupsController;
