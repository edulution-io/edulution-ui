/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { EDU_API_GROUPS_ENDPOINT } from '@libs/groups/constants/eduApiEndpoints';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import GroupsService from './groups.service';
import GetToken from '../common/decorators/getToken.decorator';
import GetCurrentOrganisationPrefix from '../common/decorators/getCurrentOrganisationPrefix.decorator';
import DeploymentTargetInterceptor from '../common/interceptors/deploymentTarget.interceptor';

@ApiTags(EDU_API_GROUPS_ENDPOINT)
@ApiBearerAuth()
@Controller(EDU_API_GROUPS_ENDPOINT)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @UseInterceptors(DeploymentTargetInterceptor)
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
