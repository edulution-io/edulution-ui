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

import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PAIRING_API_ENDPOINT, PAIRING_API_ENDPOINT_CODE } from '@libs/pairing/constants/pairingApiEndpoint';
import type SubmitPairingCodeDto from '@libs/pairing/types/submitPairingCodeDto';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import GetCurrentUserGroups from '../common/decorators/getCurrentUserGroups.decorator';
import PairingService from './pairing.service';

@Controller(PAIRING_API_ENDPOINT)
@ApiBearerAuth()
@ApiTags(PAIRING_API_ENDPOINT)
class PairingController {
  constructor(private readonly pairingService: PairingService) {}

  @Get(PAIRING_API_ENDPOINT_CODE)
  async getCode(@GetCurrentUsername() username: string, @GetCurrentUserGroups() groups: string[]) {
    const code = await this.pairingService.getOrCreateCode(username, groups);
    return { code };
  }

  @Put(PAIRING_API_ENDPOINT_CODE)
  async refreshCode(@GetCurrentUsername() username: string, @GetCurrentUserGroups() groups: string[]) {
    const code = await this.pairingService.refreshCode(username, groups);
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
}

export default PairingController;
