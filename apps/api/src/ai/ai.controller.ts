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

import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AI_AVAILABLE_ENDPOINT,
  AI_CHAT_STREAM_ENDPOINT,
  AI_CHATS_ENDPOINT,
  AI_CONFIG_ENDPOINT,
  AI_CONFIGS_ENDPOINT,
  AI_CONFIGS_MODELS_ENDPOINT,
  AI_CONFIGS_TEST_ENDPOINT,
  AI_ENDPOINT,
} from '@libs/ai/constants/aiEndpoints';
import AIChatRequestDto from '@libs/ai/types/ai.chat.request.dto';
import AvailableAiModel from '@libs/ai/types/availableAiModel';
import UserDto from '@libs/user/types/user.dto';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import ChatMessageRole from '@libs/chat/constants/chatMessageRole';
import { GetCurrentUser, GetCurrentUsername, GetToken } from '@backend-common/decorators';
import PurposeFilterDto from '@libs/ai/types/purposeFilterDto';
import AiConfigDto from '@libs/ai/types/aiConfigDto';
import AdminGuard from '../common/guards/admin.guard';
import AiService from './ai.service';
import ChatService from '../chat/chat.service';
import AiConfigService from './ai.config.service';

@ApiTags(AI_ENDPOINT)
@ApiBearerAuth()
@Controller(AI_ENDPOINT)
class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly aiConfigService: AiConfigService,
    private readonly chatService: ChatService,
  ) {}

  @Get(AI_CONFIG_ENDPOINT)
  async getUserConfig(
    @GetCurrentUser() currentUser: UserDto,
    @GetCurrentUsername() username: string,
    @Query('purpose') purpose?: string,
  ): Promise<AvailableAiModel[]> {
    const purposes = purpose ? [purpose] : [];
    return this.aiConfigService.getAvailableModelsByUserAccess(username, currentUser.ldapGroups, { purposes });
  }

  @Post(AI_CHATS_ENDPOINT)
  async createAIChat(@GetCurrentUser() user: JwtUser) {
    const chat = await this.chatService.createAIChat(user.preferred_username);
    return { id: chat.id as string };
  }

  @Get(AI_CHATS_ENDPOINT)
  async getAIChats(@GetCurrentUser() user: JwtUser) {
    const chats = await this.chatService.getAIChats(user.preferred_username);
    return chats.map((chat) => ({
      id: chat.id as string,
      title: chat.title || 'Neuer Chat',
      updatedAt: chat.updatedAt,
      aiModel: chat.aiModel,
    }));
  }

  @Get(`${AI_CHATS_ENDPOINT}/:chatId`)
  async getAIChat(@Param('chatId') chatId: string, @GetCurrentUser() user: JwtUser) {
    const chat = await this.chatService.getChat(chatId, user.preferred_username);
    if (!chat) {
      return { messages: [] };
    }
    return {
      id: chat.id as string,
      title: chat.title,
      messages: chat.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };
  }

  @Delete(`${AI_CHATS_ENDPOINT}/:chatId`)
  async deleteAIChat(@Param('chatId') chatId: string, @GetCurrentUser() user: JwtUser) {
    const success = await this.chatService.deleteChat(chatId, user.preferred_username);
    return { success };
  }

  @Post(AI_CHAT_STREAM_ENDPOINT)
  async streamChat(
    @Body() body: AIChatRequestDto,
    @Res() res: Response,
    @GetCurrentUser() user: JwtUser,
    @GetToken() token: string,
  ) {
    const { messages, chatId, configId, enabledTools = [] } = body;

    try {
      const result = await this.aiService.streamChatWithTools(configId, messages, enabledTools, token, user);
      result.pipeUIMessageStreamToResponse(res);

      if (chatId) {
        result.text
          .then((fullText) => {
            const allMessages = [...messages, { role: ChatMessageRole.ASSISTANT, content: fullText }];
            return this.chatService.saveAIMessages(chatId, allMessages, user.preferred_username);
          })
          .catch(() => {});
      }
    } catch (error) {
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post(AI_AVAILABLE_ENDPOINT)
  async getAvailableConfigs(
    @GetCurrentUser() currentUser: UserDto,
    @GetCurrentUsername() username: string,
    @Body() purposeFilterDto: PurposeFilterDto,
  ): Promise<AvailableAiModel[]> {
    return this.aiConfigService.getAvailableModelsByUserAccess(username, currentUser.ldapGroups, purposeFilterDto);
  }

  @Get(AI_CONFIGS_ENDPOINT)
  @UseGuards(AdminGuard)
  async getConfigs() {
    return this.aiConfigService.getAll();
  }

  @Get(`${AI_CONFIGS_ENDPOINT}/:id`)
  @UseGuards(AdminGuard)
  async getConfig(@Param('id') id: string) {
    return this.aiConfigService.getById(id);
  }

  @Post(AI_CONFIGS_ENDPOINT)
  @UseGuards(AdminGuard)
  async createConfig(@Body() config: Omit<AiConfigDto, 'id'>) {
    return this.aiConfigService.create(config);
  }

  @Put(`${AI_CONFIGS_ENDPOINT}/:id`)
  @UseGuards(AdminGuard)
  async updateConfig(@Param('id') id: string, @Body() config: AiConfigDto) {
    return this.aiConfigService.update(id, config);
  }

  @Delete(`${AI_CONFIGS_ENDPOINT}/:id`)
  @UseGuards(AdminGuard)
  async deleteConfig(@Param('id') id: string) {
    return this.aiConfigService.delete(id);
  }

  @Post(AI_CONFIGS_TEST_ENDPOINT)
  @UseGuards(AdminGuard)
  async testConnection(@Body() config: { url: string; apiKey: string; aiModel: string; apiStandard: string }) {
    return this.aiConfigService.testConnection(config);
  }

  @Post(AI_CONFIGS_MODELS_ENDPOINT)
  @UseGuards(AdminGuard)
  async getModels(@Body() config: { url: string; apiKey: string; apiStandard: string }) {
    return this.aiConfigService.getAvailableModels(config.url, config.apiKey, config.apiStandard);
  }
}

export default AiController;
