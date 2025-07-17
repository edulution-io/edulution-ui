/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EDU_API_GROUPS_ENDPOINT } from '@libs/groups/constants/eduApiEndpoints';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import GroupsService from './groups.service';
import GetToken from '../common/decorators/getToken.decorator';
import GetCurrentOrganisationPrefix from '../common/decorators/getCurrentOrganisationPrefix.decorator';
import DeploymentTargetGuard from '../common/guards/deploymentTarget.guard';

@ApiTags(EDU_API_GROUPS_ENDPOINT)
@ApiBearerAuth()
@Controller(EDU_API_GROUPS_ENDPOINT)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @UseGuards(DeploymentTargetGuard)
  @Get()
  async searchGroups(
    @Query('groupName') groupName: string,
    @GetCurrentOrganisationPrefix() currentOrganisationPrefix: string,
  ) {
    return this.groupsService.searchGroups(currentOrganisationPrefix, groupName);
  }

  @Get('user')
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async fetchCurrentUser(@GetToken() token: string) {
    return GroupsService.fetchCurrentUser(token);
  }
}

export default GroupsController;
