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

import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import CHAT_TYPES from '@libs/chat/constants/chatTypes';
import ChatErrorMessages from '@libs/chat/types/chatErrorMessages';
import CHAT_ROLES from '@libs/chat/constants/chatRoles';
import GROUP_TYPES from '@libs/chat/constants/groupTypes';
import { GROUP_WITH_MEMBERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import PROJECTS_PREFIX from '@libs/lmnApi/constants/prefixes/projectsPrefix';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import type GroupWithMembers from '@libs/groups/types/groupWithMembers';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import CustomHttpException from '../common/CustomHttpException';
import SseService from '../sse/sse.service';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { ChatMessage, ChatMessageDocument } from './schemas/chatMessage.schema';

@Injectable()
class ChatService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessageDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly sseService: SseService,
  ) {}

  async getOrCreateGroupConversation(groupName: string, groupType: string): Promise<ConversationDocument> {
    return this.conversationModel.findOneAndUpdate(
      { type: CHAT_TYPES.GROUP, groupName },
      {
        $setOnInsert: {
          type: CHAT_TYPES.GROUP,
          groupName,
          groupType,
        },
      },
      { upsert: true, new: true },
    );
  }

  async getMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<ChatMessageDocument[]> {
    return this.chatMessageModel.find({ conversationId }).sort({ createdAt: -1 }).skip(offset).limit(limit).exec();
  }

  async sendMessage(conversationId: string, content: string, currentUser: JwtUser): Promise<ChatMessageDocument> {
    const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) {
      throw new CustomHttpException(
        ChatErrorMessages.CONVERSATION_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        conversationId,
        ChatService.name,
      );
    }

    const message = await this.chatMessageModel.create({
      conversationId,
      content,
      role: CHAT_ROLES.USER,
      createdBy: currentUser.preferred_username,
      createdByUserFirstName: currentUser.given_name,
      createdByUserLastName: currentUser.family_name,
    });

    await this.conversationModel.findByIdAndUpdate(conversationId, { lastMessageAt: new Date() });

    if (conversation.groupName && conversation.groupType) {
      void this.notifyGroupMembers(conversation.groupName, conversation.groupType, message);
    }

    return message;
  }

  private async notifyGroupMembers(groupName: string, groupType: string, message: ChatMessageDocument): Promise<void> {
    const members = await this.getGroupMembers(groupName, groupType);

    if (members.length > 0) {
      const payload = { ...message.toJSON(), groupName, groupType };
      this.sseService.sendEventToUsers(members, JSON.stringify(payload), SSE_MESSAGE_TYPE.CHAT_NEW_MESSAGE);
    }
  }

  private async getGroupMembers(groupName: string, groupType: string): Promise<string[]> {
    const pathsToCheck = ChatService.getGroupPaths(groupName, groupType);
    const allMembers = new Set<string>();

    const groups = await Promise.all(
      pathsToCheck.map((path) => this.cacheManager.get<GroupWithMembers>(`${GROUP_WITH_MEMBERS_CACHE_KEY}-${path}`)),
    );

    groups.forEach((group) => {
      group?.members?.forEach((m) => allMembers.add(m.username));
    });

    return Array.from(allMembers);
  }

  async checkGroupAccess(groupName: string, groupType: string, username: string): Promise<boolean> {
    try {
      const pathsToCheck = ChatService.getGroupPaths(groupName, groupType);

      const groups = await Promise.all(
        pathsToCheck.map((path) => this.cacheManager.get<GroupWithMembers>(`${GROUP_WITH_MEMBERS_CACHE_KEY}-${path}`)),
      );

      return groups.some((group) => group?.members?.some((members) => members.username === username));
    } catch (error) {
      Logger.error(`Failed to check group access for user ${username}: ${error}`, ChatService.name);
      return false;
    }
  }

  private static getGroupPaths(groupName: string, groupType: string): string[] {
    const name = groupName.startsWith('/') ? groupName.substring(1) : groupName;

    if (groupType === GROUP_TYPES.PROJECT) {
      return [`${PROJECTS_PREFIX}${name}`];
    }

    if (groupType === GROUP_TYPES.CLASS) {
      return [`/${name}`];
    }

    return [];
  }
}

export default ChatService;
