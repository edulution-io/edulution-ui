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

import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import UpdateBulletinCollapsedDto from '@libs/user-preferences/types/update-bulletin-collapsed.dto';
import USER_PREFERENCES_ENDPOINT from '@libs/user-preferences/constants/user-preferences-endpoint';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import UserPreferencesService from './user-preferences.service';

@Controller(USER_PREFERENCES_ENDPOINT)
@ApiBearerAuth()
class UserPreferencesController {
  constructor(private readonly service: UserPreferencesService) {}

  @Get()
  async getPreferences(@GetCurrentUsername() currentUsername: string, @Query('fields') fields: string) {
    return this.service.getForUser(currentUsername, fields);
  }

  @Patch('bulletin-collapsed')
  async updateBulletinCollapsed(
    @GetCurrentUsername() currentUsername: string,
    @Body() dto: UpdateBulletinCollapsedDto,
  ) {
    return this.service.updateBulletinCollapsedState(currentUsername, dto);
  }
}

export default UserPreferencesController;
