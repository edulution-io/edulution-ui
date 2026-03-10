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
import { CHAT_ERROR_MESSAGES } from '@libs/chat/types/chatErrorMessages';
import CHAT_ROLES from '@libs/chat/constants/chatRoles';
import CHAT_MESSAGES_DEFAULT_LIMIT from '@libs/chat/constants/chatMessagesDefaultLimit';
import { SORT_DIRECTION, SortDirection } from '@libs/common/constants/sortDirection';
import type AllowedConversationType from '@libs/chat/types/allowedConversationType';
import { GROUP_WITH_MEMBERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import { USERS_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import SOPHOMORIX_GROUP_TYPES from '@libs/lmnApi/constants/sophomorixGroupTypes';
import PROJECTS_PREFIX from '@libs/lmnApi/constants/prefixes/projectsPrefix';
import CHAT_PROFILE_PICTURE_CACHE_KEY_PREFIX from '@libs/chat/constants/chatProfilePictureCacheKeyPrefix';
import GENERIC_CHAT_GROUP_TYPE from '@libs/chat/constants/genericChatGroupType';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import PUSH_NOTIFICATION_CHANNEL_ID from '@libs/notification/constants/pushNotificationChannelId';
import NOTIFICATION_TYPE from '@libs/notification/constants/notificationType';
import NOTIFICATION_SOURCE_TYPE from '@libs/notification/constants/notificationSourceType';
import type GroupWithMembers from '@libs/groups/types/groupWithMembers';
import escapeHtml from '@libs/common/utils/escapeHtml';
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
    conversationType: AllowedConversationType,
    username: string,
  ): Promise<ConversationDocument | null> {
    const members = await this.verifyGroupAccess(groupName, conversationType, username);
    if (members.length === 0) {
      return null;
    }
    return this.conversationModel.findOne({ type: CHAT_TYPES.GROUP, groupName, conversationType });
  }

  async getOrCreateAuthorizedConversation(
    groupName: string,
    conversationType: AllowedConversationType,
    username: string,
  ): Promise<{ conversation: ConversationDocument; members: string[] }> {
    const members = await this.verifyGroupAccess(groupName, conversationType, username);

    const conversation = await this.conversationModel.findOneAndUpdate(
      { type: CHAT_TYPES.GROUP, groupName, conversationType },
      {
        $setOnInsert: {
          type: CHAT_TYPES.GROUP,
          groupName,
          conversationType,
        },
      },
      { upsert: true, new: true },
    );

    return { conversation, members };
  }

  async getMessages(
    conversationId: string,
    limit: number = CHAT_MESSAGES_DEFAULT_LIMIT,
    offset: number = 0,
    sort: SortDirection = SORT_DIRECTION.ASC,
  ): Promise<ChatMessageDocument[]> {
    return this.chatMessageModel
      .find({ conversationId })
      .sort({ createdAt: sort === SORT_DIRECTION.ASC ? 1 : -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async sendMessage(
    conversationId: string,
    groupName: string,
    conversationType: AllowedConversationType,
    content: string,
    currentUser: JwtUser,
    members: string[],
    profilePicture?: string,
    profilePictureHash?: string,
  ): Promise<ChatMessageDocument> {
    let message: ChatMessageDocument;
    try {
      message = await this.chatMessageModel.create({
        conversationId,
        content: escapeHtml(content),
        role: CHAT_ROLES.USER,
        createdBy: currentUser.preferred_username,
        createdByUserFirstName: currentUser.given_name,
        createdByUserLastName: currentUser.family_name,
      });
    } catch (error) {
      throw new CustomHttpException(
        CHAT_ERROR_MESSAGES.MESSAGE_SEND_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { conversationId, error: error instanceof Error ? error.message : 'Unknown error' },
        ChatService.name,
      );
    }

    if (profilePicture) {
      try {
        await this.cacheProfilePicture(currentUser.preferred_username, profilePicture);
      } catch (error) {
        Logger.error(
          `Failed to cache profile picture for ${currentUser.preferred_username}: ${error}`,
          ChatService.name,
        );
      }
    }

    try {
      await this.conversationModel.findByIdAndUpdate(conversationId, { lastMessageAt: new Date() });
    } catch (error) {
      Logger.error(`Failed to update lastMessageAt for conversation ${conversationId}: ${error}`, ChatService.name);
    }

    try {
      await this.notifyGroupMembers(members, groupName, conversationType, message, profilePictureHash);
    } catch (error) {
      Logger.error(`Failed to notify group members for conversation ${conversationId}: ${error}`, ChatService.name);
    }

    return message;
  }

  private async notifyGroupMembers(
    members: string[],
    groupName: string,
    conversationType: string,
    message: ChatMessageDocument,
    profilePictureHash?: string,
  ): Promise<void> {
    const recipients = members.filter((member) => member !== message.createdBy);
    if (recipients.length === 0) {
      return;
    }

    const payload = { ...message.toJSON(), groupName, conversationType, profilePictureHash };
    this.sseService.sendEventToUsers(recipients, JSON.stringify(payload), SSE_MESSAGE_TYPE.CHAT_NEW_MESSAGE);

    const sourceId = `${conversationType}/${groupName}`;

    await this.notificationsService.upsertNotificationForSource(
      recipients,
      {
        title: groupName,
        subtitle: `${message.createdByUserFirstName} ${message.createdByUserLastName}`,
        body: message.content,
        channelId: PUSH_NOTIFICATION_CHANNEL_ID.CHAT,
        data: { groupName, conversationType, conversationId: message.conversationId.toString() },
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

  private async cacheProfilePicture(username: string, profilePicture: string): Promise<void> {
    const key = `${CHAT_PROFILE_PICTURE_CACHE_KEY_PREFIX}${username}`;
    await this.cacheManager.set(key, profilePicture, USERS_CACHE_TTL_MS);
  }

  async getProfilePictures(usernames: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};

    await Promise.all(
      usernames.map(async (username) => {
        const key = `${CHAT_PROFILE_PICTURE_CACHE_KEY_PREFIX}${username}`;
        const cached = await this.cacheManager.get<string>(key);
        if (cached) {
          result[username] = cached;
        }
      }),
    );

    return result;
  }

  private static readonly CACHE_PATH_PREFIX: Record<AllowedConversationType, string> = {
    [SOPHOMORIX_GROUP_TYPES.ADMIN_CLASS]: '/',
    [SOPHOMORIX_GROUP_TYPES.PROJECT]: PROJECTS_PREFIX,
    [GENERIC_CHAT_GROUP_TYPE]: '/',
  };

  private async verifyGroupAccess(
    groupName: string,
    conversationType: AllowedConversationType,
    username: string,
  ): Promise<string[]> {
    const cachePath = `${ChatService.CACHE_PATH_PREFIX[conversationType]}${groupName}`;
    const group = await this.cacheManager.get<GroupWithMembers>(`${GROUP_WITH_MEMBERS_CACHE_KEY}-${cachePath}`);

    if (!group) {
      return [];
    }

    if (!group.members?.some((m) => m.username === username)) {
      throw new CustomHttpException(
        CHAT_ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
        HttpStatus.FORBIDDEN,
        { groupName, conversationType },
        ChatService.name,
      );
    }

    return group.members.map((m) => m.username);
  }
}

export default ChatService;
