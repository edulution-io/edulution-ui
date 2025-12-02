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

import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import {
  GLOBAL_SETTINGS_ADMIN_ENDPOINT,
  GLOBAL_SETTINGS_PUBLIC_THEME_ENDPOINT,
  GLOBAL_SETTINGS_ROOT_ENDPOINT,
} from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { DEFAULT_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import type SentryConfig from '@libs/common/types/sentryConfig';
import AiConfigDto from '@libs/ai/types/aiConfigDto';
import AdminGuard from '../common/guards/admin.guard';
import GlobalSettingsService from './global-settings.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags(GLOBAL_SETTINGS_ROOT_ENDPOINT)
@ApiBearerAuth()
@Controller(GLOBAL_SETTINGS_ROOT_ENDPOINT)
class GlobalSettingsController {
  constructor(
    private readonly globalSettingsService: GlobalSettingsService,
    private configService: ConfigService,
  ) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(DEFAULT_CACHE_TTL_MS)
  async getGlobalSettings() {
    return this.globalSettingsService.getGlobalSettings();
  }

  @Get(GLOBAL_SETTINGS_ADMIN_ENDPOINT)
  @UseGuards(AdminGuard)
  async getGlobalAdminSettings() {
    return this.globalSettingsService.getGlobalAdminSettings();
  }

  @Put()
  @UseGuards(AdminGuard)
  async setGlobalSettings(@Body() globalSettingsDto: GlobalSettingsDto) {
    return this.globalSettingsService.setGlobalSettings(globalSettingsDto);
  }

  @Get('ai-configs')
  @UseGuards(AdminGuard)
  async getAiConfigs() {
    return this.globalSettingsService.getAiConfigs();
  }

  @Post('ai-configs')
  @UseGuards(AdminGuard)
  async createAiConfig(@Body() config: Omit<AiConfigDto, 'id'>) {
    return this.globalSettingsService.createAiConfig(config);
  }

  @Post('ai-configs/models')
  @UseGuards(AdminGuard)
  async getAvailableModels(@Body() config: { url: string; apiKey: string; apiStandard: string }) {
    return this.globalSettingsService.getAvailableModels(config.url, config.apiKey, config.apiStandard);
  }

  @Put('ai-configs/:id')
  @UseGuards(AdminGuard)
  async updateAiConfig(@Param('id') id: string, @Body() config: AiConfigDto) {
    return this.globalSettingsService.updateAiConfig(id, config);
  }

  @Delete('ai-configs/:id')
  @UseGuards(AdminGuard)
  async deleteAiConfig(@Param('id') id: string) {
    return this.globalSettingsService.deleteAiConfig(id);
  }

  @Post('ai-configs/test-connection')
  @UseGuards(AdminGuard)
  async testAiConnection(@Body() config: { url: string; apiKey: string; aiModel: string; apiStandard: string }) {
    return this.globalSettingsService.testAiConnection(config);
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(DEFAULT_CACHE_TTL_MS)
  @Get(GLOBAL_SETTINGS_PUBLIC_THEME_ENDPOINT)
  async getPublicTheme() {
    return this.globalSettingsService.getPublicTheme();
  }

  @Get('sentry')
  getSentryConfig(): SentryConfig | Record<string, never> {
    const isSentryEnabled = this.configService.get<string>('ENABLE_SENTRY', '').toLowerCase() === 'true';

    if (isSentryEnabled) {
      return {
        dsn: this.configService.get<string>('SENTRY_EDU_UI_DSN', ''),
        enabled: true,
      };
    }
    return {};
  }
}

export default GlobalSettingsController;
