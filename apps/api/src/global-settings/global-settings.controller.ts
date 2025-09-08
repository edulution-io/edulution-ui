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

import { Body, Controller, Get, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  GLOBAL_SETTINGS_ADMIN_ENDPOINT,
  GLOBAL_SETTINGS_ROOT_ENDPOINT,
} from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { DEFAULT_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import AppConfigGuard from '../appconfig/appconfig.guard';
import GlobalSettingsService from './global-settings.service';

@ApiTags(GLOBAL_SETTINGS_ROOT_ENDPOINT)
@ApiBearerAuth()
@Controller(GLOBAL_SETTINGS_ROOT_ENDPOINT)
class GlobalSettingsController {
  constructor(private readonly globalSettingsService: GlobalSettingsService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(DEFAULT_CACHE_TTL_MS)
  async getGlobalSettings() {
    return this.globalSettingsService.getGlobalSettings();
  }

  @Get(GLOBAL_SETTINGS_ADMIN_ENDPOINT)
  @UseGuards(AppConfigGuard)
  async getGlobalAdminSettings() {
    return this.globalSettingsService.getGlobalAdminSettings();
  }

  @Put()
  @UseGuards(AppConfigGuard)
  async setGlobalSettings(@Body() globalSettingsDto: GlobalSettingsDto) {
    return this.globalSettingsService.setGlobalSettings(globalSettingsDto);
  }
}

export default GlobalSettingsController;
