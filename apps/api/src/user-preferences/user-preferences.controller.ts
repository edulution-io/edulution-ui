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

import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import UpdateBulletinCollapsedDto from '@libs/user-preferences/types/update-bulletin-collapsed.dto';
import USER_PREFERENCES_ENDPOINT from '@libs/user-preferences/constants/user-preferences-endpoint';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import UserPreferencesService from './user-preferences.service';

@Controller(USER_PREFERENCES_ENDPOINT)
@ApiBearerAuth()
class UserPreferencesController {
  constructor(private readonly userPreferencesService: UserPreferencesService) {}

  @Get()
  async getPreferences(@GetCurrentUsername() currentUsername: string, @Query('fields') fields: string) {
    return this.userPreferencesService.getForUser(currentUsername, fields);
  }

  @Patch('bulletin-collapsed')
  async updateBulletinCollapsed(
    @GetCurrentUsername() currentUsername: string,
    @Body() updateBulletinCollapsedDto: UpdateBulletinCollapsedDto,
  ) {
    return this.userPreferencesService.updateBulletinCollapsedState(currentUsername, updateBulletinCollapsedDto);
  }
}

export default UserPreferencesController;
