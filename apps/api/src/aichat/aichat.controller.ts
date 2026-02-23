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

import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UIMessage } from 'ai';
import APPS from '@libs/appconfig/constants/apps';
import CHAT_ROLES from '@libs/chat/constants/chatRoles';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import GetCurrentUser from '../common/decorators/getCurrentUser.decorator';
import RequireAppAccess from '../common/decorators/requireAppAccess.decorator';
import ChatFeatureGuard from '../common/guards/chatFeature.guard';
import AiChatService from './aichat.service';

@ApiTags(APPS.AICHAT)
@ApiBearerAuth()
@RequireAppAccess(APPS.CHAT)
@UseGuards(ChatFeatureGuard)
@Controller(APPS.AICHAT)
class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Get('config')
  getConfig() {
    return this.aiChatService.getConfig();
  }

  @Get('conversations')
  async getConversations(@GetCurrentUser() currentUser: JwtUser) {
    return this.aiChatService.getConversations(currentUser.preferred_username);
  }

  @Post('conversations')
  async createConversation(@Body('title') title: string, @GetCurrentUser() currentUser: JwtUser) {
    return this.aiChatService.createConversation(currentUser.preferred_username, title);
  }

  @Delete('conversations/:id')
  async deleteConversation(@Param('id') id: string, @GetCurrentUser() currentUser: JwtUser) {
    await this.aiChatService.deleteConversation(id, currentUser.preferred_username);
  }

  @Patch('conversations/:id')
  async updateConversationTitle(
    @Param('id') id: string,
    @Body('title') title: string,
    @GetCurrentUser() currentUser: JwtUser,
  ) {
    return this.aiChatService.updateConversationTitle(id, currentUser.preferred_username, title);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') id: string,
    @GetCurrentUser() currentUser: JwtUser,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.aiChatService.getMessages(id, currentUser.preferred_username, limit, offset);
  }

  @Post('chat')
  async chat(
    @Body() body: { id: string; messages: UIMessage[] },
    @Res() res: Response,
    @GetCurrentUser() currentUser: JwtUser,
  ) {
    const { id: conversationId, messages } = body;
    const username = currentUser.preferred_username;

    const { result } = await this.aiChatService.streamChat(conversationId, messages, username);

    result.pipeUIMessageStreamToResponse(res, {
      sendReasoning: true,
      onFinish: async ({ responseMessage }) => {
        const textContent = responseMessage.parts
          .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
          .map((part) => part.text)
          .join('');

        if (textContent) {
          await this.aiChatService.saveMessage(conversationId, CHAT_ROLES.ASSISTANT, textContent, username);
        }
      },
    });
  }
}

export default AiChatController;
