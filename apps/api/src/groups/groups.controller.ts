import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import GetTokenDecorator from '../common/decorators/getToken.decorator';
import GroupsService from './groups.service';
import GetUserDecorator from '../common/decorators/getUser.decorator';
import JWTUser from '../types/JWTUser';

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

  @Post('user')
  async getUserGroups(
    @GetTokenDecorator() token: string,
    @GetUserDecorator() user: JWTUser,
    @Body() body: { lmnApiToken: string },
  ) {
    const currentUser = await this.groupsService.getOwnUserInfo(token, user.preferred_username);
    return await this.groupsService.getUserGroups(currentUser, body.lmnApiToken);
  }
}

export default GroupsController;
