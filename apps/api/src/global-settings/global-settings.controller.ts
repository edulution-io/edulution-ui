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

import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import AppConfigGuard from '../appconfig/appconfig.guard';
import GlobalSettingsService from './global-settings.service';

@ApiTags('global-settings')
@ApiBearerAuth()
@Controller('global-settings')
class GlobalSettingsController {
  constructor(private readonly globalSettingsService: GlobalSettingsService) {}

  @Get()
  async getGloablSettings() {
    return this.globalSettingsService.getGloablSettings();
  }

  @Put()
  @UseGuards(AppConfigGuard)
  async setAppSettings(@Body() settingsDto: { mfaEnforcedGroups: MultipleSelectorGroup[] }) {
    return this.globalSettingsService.setGlobalSettings(settingsDto);
  }
}

export default GlobalSettingsController;
