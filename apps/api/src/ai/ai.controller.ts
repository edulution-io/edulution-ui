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

import { Body, Controller, Delete, Get, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import type AiConfigDto from '@libs/ai/types/aiConfigDto';
import type ChatStreamDto from '@libs/ai/types/chatStreamDto';
import { AI_EDU_API_ENDPOINT } from '@libs/ai/constants/aiEndpoints';
import UserDto from '@libs/user/types/user.dto';
import AvailableAiModel from '@libs/ai/types/availableAiModel';
import PurposeFilterDto from '@libs/ai/types/purposeFilterDto';
import AdminGuard from '../common/guards/admin.guard';
import AiConfigService from './ai.config.service';
import AiService from './ai.service';
import GetCurrentUser from '../common/decorators/getCurrentUser.decorator';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import UpdateAiChatHistoryDto from '@libs/ai/types/updateAiChatHistoryDto';
import CreateAiChatHistoryDto from '@libs/ai/types/createAiChatHistoryDto';

@ApiTags(AI_EDU_API_ENDPOINT)
@ApiBearerAuth()
@Controller(AI_EDU_API_ENDPOINT)
class AiController {
  constructor(
    private readonly aiConfigService: AiConfigService,
    private readonly aiService: AiService,
  ) {}

  @Post('chat')
  async chat(@Body() options: ChatStreamDto, @Res({ passthrough: false }) res: Response) {
    try {
      const result = await this.aiService.chatStream(options);
      const response = result.toUIMessageStreamResponse();

      // Headers setzen
      res.setHeader('Content-Type', response.headers.get('Content-Type') || 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      // Body streamen
      if (response.body) {
        const reader = response.body.getReader();
        const pump = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              res.end();
              break;
            }
            res.write(value);
          }
        };
        await pump();
      } else {
        res.end();
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message || 'Internal server error' });
    }
  }

  @Post('translate')
  async translate(@Body() body: { notification: { title: string; body: string }; targetLanguage: string }) {
    return this.aiService.translateNotification(body.notification, body.targetLanguage);
  }

  @Post('available')
  async getAvailableConfigs(
    @GetCurrentUser() currentUser: UserDto,
    @GetCurrentUsername() username: string,
    @Body() purposeFilterDto: PurposeFilterDto,
  ): Promise<AvailableAiModel[]> {
    return this.aiConfigService.getAvailableModelsByUserAccess(username, currentUser.ldapGroups, purposeFilterDto);
  }

  @Get('history')
  async getChatHistory(@GetCurrentUsername() username: string) {
    return this.aiService.getChatHistory(username);
  }

  @Get('history/:id')
  async getChatById(@Param('id') id: string, @GetCurrentUsername() username: string) {
    return this.aiService.getChatById(id, username);
  }

  @Post('history')
  async createChat(@Body() body: CreateAiChatHistoryDto, @GetCurrentUsername() username: string) {
    return this.aiService.createChat(username, body.title || 'Neuer Chat', body.messages);
  }

  @Put('history/:id')
  async updateChat(
    @Param('id') id: string,
    @Body() body: UpdateAiChatHistoryDto,
    @GetCurrentUsername() username: string,
  ) {
    return this.aiService.updateChat(id, username, body.messages);
  }

  @Delete('history/:id')
  async deleteChat(@Param('id') id: string, @GetCurrentUsername() username: string) {
    return this.aiService.deleteChat(id, username);
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
