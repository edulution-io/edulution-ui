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
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import APPS from '@libs/appconfig/constants/apps';
import CreateMessageDto from '@libs/chat/types/createMessageDto';
import UserChatGroups from '@libs/chat/types/userChatGroups';
import CHAT_MESSAGES_DEFAULT_LIMIT from '@libs/chat/constants/chatMessagesDefaultLimit';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import GroupsService from '../groups/groups.service';
import ChatService from './chat.service';
import { ChatMessageDocument } from './schemas/chatMessage.schema';
import GetCurrentUser from '../common/decorators/getCurrentUser.decorator';
import validateConversationType from './validateConversationType';

@ApiTags(APPS.CHAT)
@ApiBearerAuth()
@Controller(APPS.CHAT)
class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly groupsService: GroupsService,
  ) {}

  @Get('groups')
  async getUserGroups(@GetCurrentUser() currentUser: JwtUser): Promise<UserChatGroups> {
    return this.groupsService.getUserGroupsAndProjects(currentUser.preferred_username);
  }

  @Get('conversations/:conversationType/:groupName/messages')
  async getMessages(
    @Param('conversationType') rawConversationType: string,
    @Param('groupName') groupName: string,
    @GetCurrentUser() currentUser: JwtUser,
    @Query('limit', new DefaultValuePipe(CHAT_MESSAGES_DEFAULT_LIMIT), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('sort', new DefaultValuePipe('asc')) sort: string,
  ): Promise<ChatMessageDocument[]> {
    const conversationType = validateConversationType(rawConversationType);
    const conversation = await this.chatService.getAuthorizedConversation(
      groupName,
      conversationType,
      currentUser.preferred_username,
    );

    if (!conversation) {
      return [];
    }

    return this.chatService.getMessages(String(conversation.id), limit, offset, sort);
  }

  @Post('conversations/:conversationType/:groupName/messages')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async sendMessage(
    @Param('conversationType') rawConversationType: string,
    @Param('groupName') groupName: string,
    @Body() dto: CreateMessageDto,
    @GetCurrentUser() currentUser: JwtUser,
  ): Promise<ChatMessageDocument> {
    const conversationType = validateConversationType(rawConversationType);
    const { conversation, members } = await this.chatService.getOrCreateAuthorizedConversation(
      groupName,
      conversationType,
      currentUser.preferred_username,
    );

    return this.chatService.sendMessage(
      String(conversation.id),
      groupName,
      conversationType,
      dto.content,
      currentUser,
      members,
    );
  }
}

export default ChatController;
