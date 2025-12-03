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

import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type AiConfigDto from '@libs/ai/types/aiConfigDto';
import type AiRequestOptions from '@libs/ai/types/aiRequestOptions';
import { AI_EDU_API_ENDPOINT } from '@libs/ai/constants/aiEndpoints';
import UserDto from '@libs/user/types/user.dto';
import AvailableAiModel from '@libs/ai/types/availableAiModel';
import AdminGuard from '../common/guards/admin.guard';
import AiConfigService from './ai.config.service';
import AiService from './ai.service';
import GetCurrentUser from '../common/decorators/getCurrentUser.decorator';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';

@ApiTags(AI_EDU_API_ENDPOINT)
@ApiBearerAuth()
@Controller(AI_EDU_API_ENDPOINT)
class AiController {
  constructor(
    private readonly aiConfigService: AiConfigService,
    private readonly aiService: AiService,
  ) {}

  @Post('chat')
  async chat(@Body() options: AiRequestOptions) {
    const response = await this.aiService.chat(options);
    return { response };
  }

  @Post('translate')
  async translate(@Body() body: { notification: { title: string; body: string }; targetLanguage: string }) {
    return this.aiService.translateNotification(body.notification, body.targetLanguage);
  }

  @Get('available')
  async getAvailableConfigs(
    @GetCurrentUser() currentUser: UserDto,
    @GetCurrentUsername() username: string,
    @Query('purpose') purpose?: string,
  ): Promise<AvailableAiModel[]> {
    return this.aiConfigService.getAvailableModelsByUserAccess(username, currentUser.ldapGroups, purpose);
  }

  @Get('configs')
  @UseGuards(AdminGuard)
  async getConfigs() {
    return this.aiConfigService.getAll();
  }

  @Get('configs/:id')
  @UseGuards(AdminGuard)
  async getConfig(@Param('id') id: string) {
    return this.aiConfigService.getById(id);
  }

  @Post('configs')
  @UseGuards(AdminGuard)
  async createConfig(@Body() config: Omit<AiConfigDto, 'id'>) {
    return this.aiConfigService.create(config);
  }

  @Put('configs/:id')
  @UseGuards(AdminGuard)
  async updateConfig(@Param('id') id: string, @Body() config: AiConfigDto) {
    return this.aiConfigService.update(id, config);
  }

  @Delete('configs/:id')
  @UseGuards(AdminGuard)
  async deleteConfig(@Param('id') id: string) {
    return this.aiConfigService.delete(id);
  }

  @Post('configs/test')
  @UseGuards(AdminGuard)
  async testConnection(@Body() config: { url: string; apiKey: string; aiModel: string; apiStandard: string }) {
    return this.aiConfigService.testConnection(config);
  }

  @Post('configs/models')
  @UseGuards(AdminGuard)
  async getModels(@Body() config: { url: string; apiKey: string; apiStandard: string }) {
    return this.aiConfigService.getAvailableModels(config.url, config.apiKey, config.apiStandard);
  }
}

export default AiController;
