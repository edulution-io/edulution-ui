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

import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import CHAT_TYPES from '@libs/chat/constants/chatTypes';
import { CHAT_ERROR_MESSAGES } from '@libs/chat/types/chatErrorMessages';
import CHAT_ROLES from '@libs/chat/constants/chatRoles';
import GROUP_TYPES from '@libs/chat/constants/groupTypes';
import GroupType from '@libs/chat/types/groupType';
import { GROUP_WITH_MEMBERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import PROJECTS_PREFIX from '@libs/lmnApi/constants/prefixes/projectsPrefix';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import PUSH_NOTIFICATION_CHANNEL_ID from '@libs/notification/constants/pushNotificationChannelId';
import NOTIFICATION_TYPE from '@libs/notification/constants/notificationType';
import NOTIFICATION_SOURCE_TYPE from '@libs/notification/constants/notificationSourceType';
import type GroupWithMembers from '@libs/groups/types/groupWithMembers';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import CustomHttpException from '../common/CustomHttpException';
import NotificationsService from '../notifications/notifications.service';
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
    private readonly notificationsService: NotificationsService,
  ) {}

  async getAuthorizedConversation(
    groupName: string,
    groupType: GroupType,
    username: string,
  ): Promise<ConversationDocument> {
    await this.verifyGroupAccess(groupName, groupType, username);

    const conversation = await this.conversationModel.findOne({ type: CHAT_TYPES.GROUP, groupName });

    if (!conversation) {
      throw new CustomHttpException(
        CHAT_ERROR_MESSAGES.CONVERSATION_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { groupName, groupType },
        ChatService.name,
      );
    }

    return conversation;
  }

  async getOrCreateAuthorizedConversation(
    groupName: string,
    groupType: GroupType,
    username: string,
  ): Promise<{ conversation: ConversationDocument; members: string[] }> {
    const members = await this.verifyGroupAccess(groupName, groupType, username);

    const conversation = await this.conversationModel.findOneAndUpdate(
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

    return { conversation, members };
  }

  async getMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<ChatMessageDocument[]> {
    return this.chatMessageModel.find({ conversationId }).sort({ createdAt: -1 }).skip(offset).limit(limit).exec();
  }

  async sendMessage(
    conversationId: string,
    groupName: string,
    groupType: GroupType,
    content: string,
    currentUser: JwtUser,
    members: string[],
  ): Promise<ChatMessageDocument> {
    const message = await this.chatMessageModel.create({
      conversationId,
      content,
      role: CHAT_ROLES.USER,
      createdBy: currentUser.preferred_username,
      createdByUserFirstName: currentUser.given_name,
      createdByUserLastName: currentUser.family_name,
    });

    await this.conversationModel.findByIdAndUpdate(conversationId, { lastMessageAt: new Date() });

    await this.notifyGroupMembers(members, groupName, groupType, message);

    return message;
  }

  private async notifyGroupMembers(
    members: string[],
    groupName: string,
    groupType: GroupType,
    message: ChatMessageDocument,
  ): Promise<void> {
    if (members.length === 0) {
      return;
    }

    const payload = { ...message.toJSON(), groupName, groupType };
    this.sseService.sendEventToUsers(members, JSON.stringify(payload), SSE_MESSAGE_TYPE.CHAT_NEW_MESSAGE);

    const recipients = members.filter((member) => member !== message.createdBy);
    if (recipients.length > 0) {
      const sourceId = `${groupType}/${groupName}`;

      await this.notificationsService.upsertNotificationForSource(
        recipients,
        {
          title: groupName,
          subtitle: `${message.createdByUserFirstName} ${message.createdByUserLastName}`,
          body: message.content,
          channelId: PUSH_NOTIFICATION_CHANNEL_ID.CHAT,
          data: { groupName, groupType, conversationId: message.conversationId },
        },
        message.createdBy,
        {
          type: NOTIFICATION_TYPE.USER,
          sourceType: NOTIFICATION_SOURCE_TYPE.CHAT,
          sourceId,
          title: groupName,
          pushNotification: `${message.createdByUserFirstName} ${message.createdByUserLastName}: ${message.content}`,
          createdBy: message.createdBy,
        },
      );
    }
  }

  private async verifyGroupAccess(groupName: string, groupType: GroupType, username: string): Promise<string[]> {
    const groups = await this.fetchGroupsFromCache(groupName, groupType);

    const hasAccess = groups.some((group) => group?.members?.some((member) => member.username === username));

    if (!hasAccess) {
      throw new CustomHttpException(
        CHAT_ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
        HttpStatus.FORBIDDEN,
        { groupName, groupType },
        ChatService.name,
      );
    }

    return ChatService.resolveMembers(groups);
  }

  private async fetchGroupsFromCache(groupName: string, groupType: GroupType): Promise<(GroupWithMembers | null)[]> {
    const pathsToCheck = ChatService.getGroupPaths(groupName, groupType);

    return Promise.all(
      pathsToCheck.map((path) => this.cacheManager.get<GroupWithMembers>(`${GROUP_WITH_MEMBERS_CACHE_KEY}-${path}`)),
    );
  }

  private static resolveMembers(groups: (GroupWithMembers | null)[]): string[] {
    const allMembers = new Set<string>();

    groups.forEach((group) => {
      group?.members?.forEach((member) => allMembers.add(member.username));
    });

    return Array.from(allMembers);
  }

  private static getGroupPaths(groupName: string, groupType: GroupType): string[] {
    const name = groupName.startsWith('/') ? groupName.substring(1) : groupName;

    switch (groupType) {
      case GROUP_TYPES.PROJECT:
        return [`${PROJECTS_PREFIX}${name}`];
      case GROUP_TYPES.CLASS:
        return [`/${name}`];
      default:
        throw new CustomHttpException(
          CHAT_ERROR_MESSAGES.INVALID_GROUP_TYPE,
          HttpStatus.BAD_REQUEST,
          { groupType },
          ChatService.name,
        );
    }
  }
}

export default ChatService;
