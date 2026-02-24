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

import { Body, Controller, Get, Headers, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import PARENT_CHILD_PAIRING_API_ENDPOINTS from '@libs/parent-child-pairing/constants/parentChildPairingApiEndpoints';
import type SubmitParentChildPairingCodeDto from '@libs/parent-child-pairing/types/submitParentChildPairingCodeDto';
import type UpdateParentChildPairingStatusDto from '@libs/parent-child-pairing/types/updateParentChildPairingStatusDto';
import PARENT_CHILD_PAIRING_QUERY_PARAMS from '@libs/parent-child-pairing/constants/parentChildPairingQueryParams';
import type ParentChildPairingStatusType from '@libs/parent-child-pairing/types/parentChildPairingStatusType';
import type JwtUser from '@libs/user/types/jwt/jwtUser';
import GetCurrentUser from '../common/decorators/getCurrentUser.decorator';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import GetCurrentUserGroups from '../common/decorators/getCurrentUserGroups.decorator';
import ParentChildPairingService from './parent-child-pairing.service';
import DynamicAppAccessGuard from '../common/guards/dynamicAppAccess.guard';

@Controller(PARENT_CHILD_PAIRING_API_ENDPOINTS.BASE)
@ApiBearerAuth()
@ApiTags(PARENT_CHILD_PAIRING_API_ENDPOINTS.BASE)
class ParentChildPairingController {
  constructor(private readonly parentChildPairingService: ParentChildPairingService) {}

  @Get(PARENT_CHILD_PAIRING_API_ENDPOINTS.CODE)
  async getCode(
    @GetCurrentUsername() username: string,
    @GetCurrentUserGroups() groups: string[],
    @GetCurrentUser() user: JwtUser,
  ) {
    return this.parentChildPairingService.getOrCreateCode(username, groups, user.school);
  }

  @Put(PARENT_CHILD_PAIRING_API_ENDPOINTS.CODE)
  async refreshCode(
    @GetCurrentUsername() username: string,
    @GetCurrentUserGroups() groups: string[],
    @GetCurrentUser() user: JwtUser,
  ) {
    return this.parentChildPairingService.refreshCode(username, groups, user.school);
  }

  @Post()
  async createParentChildPairing(
    @GetCurrentUsername() username: string,
    @GetCurrentUserGroups() groups: string[],
    @GetCurrentUser() user: JwtUser,
    @Body() body: SubmitParentChildPairingCodeDto,
  ) {
    return this.parentChildPairingService.createParentChildPairing(username, groups, user.school, body.code);
  }

  @Get(PARENT_CHILD_PAIRING_API_ENDPOINTS.RELATIONSHIPS)
  async getEnrichedRelationships(
    @GetCurrentUsername() username: string,
    @GetCurrentUserGroups() groups: string[],
    @GetCurrentUser() user: JwtUser,
  ) {
    return this.parentChildPairingService.getEnrichedRelationships(username, groups, user.school);
  }

  @Get(PARENT_CHILD_PAIRING_API_ENDPOINTS.ALL)
  @UseGuards(DynamicAppAccessGuard)
  async getAllParentChildPairings(
    @Query(PARENT_CHILD_PAIRING_QUERY_PARAMS.STATUS) status?: ParentChildPairingStatusType,
    @Query(PARENT_CHILD_PAIRING_QUERY_PARAMS.SCHOOL) school?: string,
  ) {
    return this.parentChildPairingService.getAllParentChildPairings(status, school);
  }

  @Patch(`:id/${PARENT_CHILD_PAIRING_API_ENDPOINTS.STATUS}`)
  @UseGuards(DynamicAppAccessGuard)
  async updateParentChildPairingStatus(
    @Param('id') id: string,
    @Body() body: UpdateParentChildPairingStatusDto,
    @GetCurrentUsername() username: string,
    @Headers(HTTP_HEADERS.XApiKey) lmnApiToken: string,
  ) {
    return this.parentChildPairingService.updateParentChildPairingStatus(id, body.status, username, lmnApiToken);
  }
}

export default ParentChildPairingController;
