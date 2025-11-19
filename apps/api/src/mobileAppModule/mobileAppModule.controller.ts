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

import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Injectable } from '@nestjs/common';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import MobileAppModuleService from './mobileAppModule.service';
import GetCurrentUserGroups from '../common/decorators/getCurrentUserGroups.decorator';

@ApiTags('mobile-app')
@Controller('mobile-app')
@Injectable()
class MobileAppModuleController {
  constructor(private readonly edulutionAppService: MobileAppModuleService) {}

  @Get('user-data')
  async getAppUserData(@GetCurrentUsername() username: string, @GetCurrentUserGroups() currentUserGroups: string[]) {
    return this.edulutionAppService.getAppUserData(username, currentUserGroups);
  }

  @Get('totp-info')
  async getTotpInfo(@GetCurrentUsername() username: string) {
    return this.edulutionAppService.getTotpInfo(username);
  }
}

export default MobileAppModuleController;
