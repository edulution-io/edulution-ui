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

import { Body, Controller, Get, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import APPS from '@libs/appconfig/constants/apps';
import CreateMessageDto from '@libs/chat/types/createMessageDto';
import ChatErrorMessages from '@libs/chat/types/chatErrorMessages';
import GroupType from '@libs/chat/types/groupType';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import CustomHttpException from '../common/CustomHttpException';
import ChatService from './chat.service';
import { ChatMessageDocument } from './schemas/chatMessage.schema';
import GetCurrentUser from '../common/decorators/getCurrentUser.decorator';

// TODO Build endpoint to get user groups without token

@ApiTags(APPS.CHAT)
@ApiBearerAuth()
@Controller(APPS.CHAT)
class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('group/:groupType/:groupName/messages')
  async getMessages(
    @Param('groupType') groupType: GroupType,
    @Param('groupName') groupName: string,
    @GetCurrentUser() currentUser: JwtUser,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<ChatMessageDocument[]> {
    const hasAccess = await this.chatService.checkGroupAccess(groupName, groupType, currentUser.preferred_username);

    if (!hasAccess) {
      throw new CustomHttpException(
        ChatErrorMessages.UNAUTHORIZED_ACCESS,
        HttpStatus.FORBIDDEN,
        { groupName, groupType },
        ChatController.name,
      );
    }

    const conversation = await this.chatService.getOrCreateGroupConversation(groupName, groupType);

    // TODO FontAwsome Icon Mobile vll noch 10 Nachrichten desktop vll 20
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

    return this.chatService.getMessages(conversation.conversationId, parsedLimit, parsedOffset);
  }

  @Post('group/:groupType/:groupName/messages')
  async sendMessage(
    @Param('groupType') groupType: GroupType,
    @Param('groupName') groupName: string,
    @Body() dto: CreateMessageDto,
    @GetCurrentUser() currentUser: JwtUser,
  ): Promise<ChatMessageDocument> {
    const hasAccess = await this.chatService.checkGroupAccess(groupName, groupType, currentUser.preferred_username);

    if (!hasAccess) {
      throw new CustomHttpException(
        ChatErrorMessages.UNAUTHORIZED_ACCESS,
        HttpStatus.FORBIDDEN,
        { groupName, groupType },
        ChatController.name,
      );
    }

    const conversation = await this.chatService.getOrCreateGroupConversation(groupName, groupType);

    return this.chatService.sendMessage(conversation.conversationId, dto.content, currentUser);
  }
}

export default ChatController;
