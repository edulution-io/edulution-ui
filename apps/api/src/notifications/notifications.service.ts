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

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import pickDefinedNotificationFields from '@libs/notification/utils/pickDefinedNotificationFields';
import SendPushNotificationDto from '@libs/notification/types/send-pushNotification.dto';
import CreateMessageDto from '@libs/notification/types/createMessage.dto';
import USER_MESSAGE_STATUS from '@libs/notification/constants/userMessageStatus';
import UsersService from '../users/users.service';
import { Message, MessageDocument } from './message.schema';
import { UserMessage, UserMessageDocument } from './userMessage.schema';

@Injectable()
class NotificationsService {
  private readonly expo = new Expo();

  constructor(
    private userService: UsersService,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(UserMessage.name) private userMessageModel: Model<UserMessageDocument>,
  ) {}

  async sendPushNotification(sendPushNotificationDto: SendPushNotificationDto): Promise<void> {
    const tokens = Array.isArray(sendPushNotificationDto.to)
      ? sendPushNotificationDto.to
      : [sendPushNotificationDto.to];

    const messages: ExpoPushMessage[] = tokens.map((token: string) => ({
      to: token,
      ...pickDefinedNotificationFields({
        _contentAvailable: sendPushNotificationDto.contentAvailable,
        data: sendPushNotificationDto.data,
        title: sendPushNotificationDto.title,
        body: sendPushNotificationDto.body,
        ttl: sendPushNotificationDto.ttl,
        expiration: sendPushNotificationDto.expiration,
        priority: sendPushNotificationDto.priority,
        subtitle: sendPushNotificationDto.subtitle,
        sound: sendPushNotificationDto.sound,
        badge: sendPushNotificationDto.badge,
        interruptionLevel: sendPushNotificationDto.interruptionLevel,
        channelId: sendPushNotificationDto.channelId,
        icon: sendPushNotificationDto.icon,
        richContent: sendPushNotificationDto.richContent,
        categoryId: sendPushNotificationDto.categoryId,
        mutableContent: sendPushNotificationDto.mutableContent,
        accessToken: sendPushNotificationDto.accessToken,
      }),
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    await Promise.all(chunks.map((chunk) => this.expo.sendPushNotificationsAsync(chunk)));
  }

  async notifyUsernames(
    usernames: string[],
    partialNotification: Omit<SendPushNotificationDto, 'to'>,
    persistOptions?: CreateMessageDto,
  ): Promise<void> {
    let messageId: Types.ObjectId | null = null;

    if (persistOptions) {
      const message = await this.createMessage(persistOptions);
      messageId = new Types.ObjectId(String(message.id));
      await this.createUserMessages(messageId, usernames);
    }

    const uniqueTokens = await this.userService.getPushTokensByUsersnames(usernames);

    try {
      await this.sendPushNotification({
        to: uniqueTokens,
        ...partialNotification,
      });
      if (messageId) {
        await this.updateUserMessageStatus(messageId, usernames, USER_MESSAGE_STATUS.SENT);
      }
    } catch (error) {
      Logger.error(`Failed to send push notification: ${error}`, NotificationsService.name);
      if (messageId) {
        await this.updateUserMessageStatus(messageId, usernames, USER_MESSAGE_STATUS.FAILED);
      }
      throw error;
    }
  }

  async createMessage(createMessageDto: CreateMessageDto): Promise<MessageDocument> {
    const message = await this.messageModel.create(createMessageDto);
    return message;
  }

  async createUserMessages(messageId: Types.ObjectId, recipients: string[]): Promise<UserMessageDocument[]> {
    const userMessages = recipients.map((recipient) => ({
      messageId,
      recipient,
      readAt: null,
      deletedAt: null,
      status: USER_MESSAGE_STATUS.PENDING,
    }));
    return this.userMessageModel.insertMany(userMessages);
  }

  async updateUserMessageStatus(
    messageId: Types.ObjectId,
    recipients: string[],
    status: (typeof USER_MESSAGE_STATUS)[keyof typeof USER_MESSAGE_STATUS],
  ): Promise<void> {
    await this.userMessageModel.updateMany({ messageId, recipient: { $in: recipients } }, { $set: { status } });
  }

  async getInboxMessages(
    recipient: string,
    limit = 20,
    offset = 0,
  ): Promise<{ messages: MessageDocument[]; total: number }> {
    const userMessages = await this.userMessageModel
      .find({ recipient, deletedAt: null })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate<{ messageId: MessageDocument }>('messageId')
      .exec();

    const total = await this.userMessageModel.countDocuments({ recipient, deletedAt: null });

    const messages = userMessages.map((um) => um.messageId).filter((m): m is MessageDocument => m !== null);

    return { messages, total };
  }

  async getUnreadCount(recipient: string): Promise<number> {
    return this.userMessageModel.countDocuments({ recipient, readAt: null, deletedAt: null });
  }

  async markAsRead(messageId: string, recipient: string): Promise<void> {
    await this.userMessageModel.updateOne(
      { messageId: new Types.ObjectId(messageId), recipient },
      { $set: { readAt: new Date() } },
    );
  }

  async markAllAsRead(recipient: string): Promise<void> {
    await this.userMessageModel.updateMany(
      { recipient, readAt: null, deletedAt: null },
      { $set: { readAt: new Date() } },
    );
  }

  async deleteUserMessage(messageId: string, recipient: string): Promise<void> {
    await this.userMessageModel.updateOne(
      { messageId: new Types.ObjectId(messageId), recipient },
      { $set: { deletedAt: new Date() } },
    );
  }

  async deleteMessagesBySource(sourceType: string, sourceId: string): Promise<void> {
    const messages = await this.messageModel.find({
      sourceType,
      sourceId,
    });

    const messageIds = messages.map((m) => new Types.ObjectId(String(m.id)));

    await this.userMessageModel.deleteMany({ messageId: { $in: messageIds } });
    await this.messageModel.deleteMany({ _id: { $in: messageIds } });
  }
}

export default NotificationsService;
