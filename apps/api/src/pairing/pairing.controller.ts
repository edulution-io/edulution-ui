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

import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PAIRING_API_ENDPOINT, PAIRING_API_ENDPOINT_CODE } from '@libs/pairing/constants/pairingApiEndpoint';
import PAIRING_ADMIN_ENDPOINTS from '@libs/pairing/constants/pairingAdminEndpoints';
import PAIRING_STATUS from '@libs/pairing/constants/pairingStatus';
import type SubmitPairingCodeDto from '@libs/pairing/types/submitPairingCodeDto';
import type UpdatePairingStatusDto from '@libs/pairing/types/updatePairingStatusDto';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import GetCurrentUserGroups from '../common/decorators/getCurrentUserGroups.decorator';
import AdminGuard from '../common/guards/admin.guard';
import PairingService from './pairing.service';

const DEFAULT_PAGE_LIMIT = 50;

@Controller(PAIRING_API_ENDPOINT)
@ApiBearerAuth()
@ApiTags(PAIRING_API_ENDPOINT)
class PairingController {
  constructor(private readonly pairingService: PairingService) {}

  @Get(PAIRING_API_ENDPOINT_CODE)
  async getCode(@GetCurrentUsername() username: string) {
    const code = await this.pairingService.getOrCreateCode(username);
    return { code };
  }

  @Put(PAIRING_API_ENDPOINT_CODE)
  async refreshCode(@GetCurrentUsername() username: string) {
    const code = await this.pairingService.refreshCode(username);
    return { code };
  }

  @Post()
  async createPairing(
    @GetCurrentUsername() username: string,
    @GetCurrentUserGroups() groups: string[],
    @Body() body: SubmitPairingCodeDto,
  ) {
    return this.pairingService.createPairing(username, groups, body.code);
  }

  @Get()
  async getRelationships(@GetCurrentUsername() username: string, @GetCurrentUserGroups() groups: string[]) {
    return this.pairingService.getRelationships(username, groups);
  }

  @Get(PAIRING_ADMIN_ENDPOINTS.ALL)
  @UseGuards(AdminGuard)
  @ApiQuery({ name: 'status', required: false, type: String, example: PAIRING_STATUS.PENDING })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: DEFAULT_PAGE_LIMIT })
  async getAllPairings(
    @Query('status') status: string = PAIRING_STATUS.PENDING,
    @Query('page') page = '1',
    @Query('limit') limit = String(DEFAULT_PAGE_LIMIT),
  ) {
    const p = Math.max(1, parseInt(page, 10));
    const l = Math.min(DEFAULT_PAGE_LIMIT, Math.max(1, parseInt(limit, 10)));
    return this.pairingService.getAllPairings(status, p, l);
  }

  @Patch(`:id/${PAIRING_ADMIN_ENDPOINTS.STATUS}`)
  @UseGuards(AdminGuard)
  async updatePairingStatus(@Param('id') id: string, @Body() body: UpdatePairingStatusDto) {
    return this.pairingService.updatePairingStatus(id, body.status);
  }
}

export default PairingController;
