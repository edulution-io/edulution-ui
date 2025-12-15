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

import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CHAT_AI_CHATS_ENDPOINT,
  CHAT_ENDPOINT,
  CHAT_GROUPS_ENDPOINT,
  CHAT_USERS_ENDPOINT,
  CHATS_ENDPOINT,
  MESSAGES_ENDPOINT,
} from '@libs/chat/constants/chatEndpoints';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import GetCurrentUser from '@backend-common/decorators/get-current-user.decorator';
import ChatService from './chat.service';

@Controller(CHAT_ENDPOINT)
@ApiTags(CHAT_ENDPOINT)
@ApiBearerAuth()
class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post(CHAT_AI_CHATS_ENDPOINT)
  async createAIChat(@GetCurrentUser() user: JwtUser) {
    const chat = await this.chatService.createAIChat(user.preferred_username);
    return { id: chat.id as string };
  }

  @Get(CHAT_AI_CHATS_ENDPOINT)
  async getAIChats(@GetCurrentUser() user: JwtUser) {
    const chats = await this.chatService.getAIChats(user.preferred_username);
    return chats.map((chat) => ({
      id: chat.id as string,
      title: chat.title || 'Neuer Chat',
      updatedAt: chat.updatedAt,
      aiModel: chat.aiModel,
    }));
  }

  @Get(`${CHAT_AI_CHATS_ENDPOINT}/:chatId`)
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

  @Delete(`${CHAT_AI_CHATS_ENDPOINT}/:chatId`)
  async deleteAIChat(@Param('chatId') chatId: string, @GetCurrentUser() user: JwtUser) {
    const success = await this.chatService.deleteChat(chatId, user.preferred_username);
    return { success };
  }

  @Get(CHAT_USERS_ENDPOINT)
  async getUserChats(@GetCurrentUser() user: JwtUser) {
    const chats = await this.chatService.getUserChats(user.preferred_username);
    return chats.map((chat) => {
      const otherParticipant = chat.participants.find((p) => p.username !== user.preferred_username);
      const lastMessage = chat.messages[chat.messages.length - 1];
      return {
        id: chat.id as string,
        participant: otherParticipant,
        lastMessage: lastMessage?.content,
        updatedAt: chat.updatedAt,
      };
    });
  }

  @Post(`${CHAT_USERS_ENDPOINT}/:targetUsername`)
  async createOrGetUserChat(@Param('targetUsername') targetUsername: string, @GetCurrentUser() user: JwtUser) {
    const chat = await this.chatService.findOrCreateUserChat(user.preferred_username, targetUsername);
    return { id: chat.id as string };
  }

  @Get(CHAT_GROUPS_ENDPOINT)
  async getGroupChats(@GetCurrentUser() user: JwtUser) {
    const chats = await this.chatService.getGroupChats(user.preferred_username);
    return chats.map((chat) => ({
      id: chat.id as string,
      groupCn: chat.groupCn,
      groupName: chat.groupName,
      updatedAt: chat.updatedAt,
    }));
  }

  @Post(`${CHAT_GROUPS_ENDPOINT}/:groupCn`)
  async createOrGetGroupChat(
    @Param('groupCn') groupCn: string,
    @Body() body: { groupName?: string },
    @GetCurrentUser() user: JwtUser,
  ) {
    const chat = await this.chatService.findOrCreateGroupChat(
      groupCn,
      body.groupName || groupCn,
      user.preferred_username,
    );
    return { id: chat.id as string };
  }

  @Get(`${CHATS_ENDPOINT}/:chatId`)
  async getChat(@Param('chatId') chatId: string, @GetCurrentUser() user: JwtUser) {
    const chat = await this.chatService.getChat(chatId, user.preferred_username);
    if (!chat) {
      return null;
    }
    return {
      type: chat.type,
      title: chat.title,
      participants: chat.participants,
      messages: chat.messages,
      updatedAt: chat.updatedAt,
    };
  }

  @Post(`${CHATS_ENDPOINT}/:chatId/${MESSAGES_ENDPOINT}`)
  async addMessage(
    @Param('chatId') chatId: string,
    @Body() body: { content: string },
    @GetCurrentUser() user: JwtUser,
  ) {
    const chat = await this.chatService.addMessage(chatId, {
      senderUsername: user.preferred_username,
      content: body.content,
      role: 'user',
    });
    return { success: !!chat };
  }
}

export default ChatController;
