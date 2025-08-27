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

import { Body, Controller, Delete, Get, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  GLOBAL_SETTINGS_ADMIN_ENDPOINT,
  GLOBAL_SETTINGS_BRANDING_LOGO_ENDPOINT,
  GLOBAL_SETTINGS_ROOT_ENDPOINT,
  GLOBAL_SETTINGS_SCHOOL_INFO_ENDPOINT,
} from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { DEFAULT_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import AppConfigGuard from '../appconfig/appconfig.guard';
import GlobalSettingsService from './global-settings.service';
import { Public } from '../common/decorators/public.decorator';

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

  @Public()
  @Get(GLOBAL_SETTINGS_BRANDING_LOGO_ENDPOINT)
  async getBrandingLogo(@Res() res: Response) {
    return this.globalSettingsService.getBrandingLogo('branding/logo', res);
  }

  @Public()
  @Get(GLOBAL_SETTINGS_SCHOOL_INFO_ENDPOINT)
  async getSchoolInfo() {
    return this.globalSettingsService.getSchoolInfo();
  }

  @Put(GLOBAL_SETTINGS_BRANDING_LOGO_ENDPOINT)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @UseGuards(AppConfigGuard)
  async setBrandingLogo(@UploadedFile() file: Express.Multer.File) {
    return this.globalSettingsService.setBrandingLogo(file);
  }

  @Delete(GLOBAL_SETTINGS_BRANDING_LOGO_ENDPOINT)
  async removeBrandingLogo() {
    return this.globalSettingsService.removeBrandingLogo();
  }
}

export default GlobalSettingsController;
