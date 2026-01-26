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
import CreateNotificationDto from '@libs/notification/types/createNotification.dto';
import USER_NOTIFICATION_STATUS from '@libs/notification/constants/userNotificationStatus';
import UsersService from '../users/users.service';
import { Notification, NotificationDocument } from './notification.schema';
import { UserNotification, UserNotificationDocument } from './userNotification.schema';

@Injectable()
class NotificationsService {
  private readonly expo = new Expo();

  constructor(
    private userService: UsersService,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(UserNotification.name) private userNotificationModel: Model<UserNotificationDocument>,
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
    persistOptions?: CreateNotificationDto,
  ): Promise<void> {
    let notificationId: Types.ObjectId | null = null;

    if (persistOptions) {
      const notification = await this.createNotification(persistOptions);
      notificationId = new Types.ObjectId(String(notification.id));
      await this.createUserNotifications(notificationId, usernames);
    }

    const uniqueTokens = await this.userService.getPushTokensByUsersnames(usernames);

    try {
      await this.sendPushNotification({
        to: uniqueTokens,
        ...partialNotification,
      });
      if (notificationId) {
        await this.updateUserNotificationStatus(notificationId, usernames, USER_NOTIFICATION_STATUS.SENT);
      }
    } catch (error) {
      Logger.error(`Failed to send push notification: ${error}`, NotificationsService.name);
      if (notificationId) {
        await this.updateUserNotificationStatus(notificationId, usernames, USER_NOTIFICATION_STATUS.FAILED);
      }
      throw error;
    }
  }

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<NotificationDocument> {
    const notification = await this.notificationModel.create(createNotificationDto);
    return notification;
  }

  async createUserNotifications(
    notificationId: Types.ObjectId,
    usernames: string[],
  ): Promise<UserNotificationDocument[]> {
    const userNotifications = usernames.map((username) => ({
      notificationId,
      username,
      readAt: null,
      deletedAt: null,
      status: USER_NOTIFICATION_STATUS.PENDING,
    }));
    return this.userNotificationModel.insertMany(userNotifications);
  }

  async updateUserNotificationStatus(
    notificationId: Types.ObjectId,
    usernames: string[],
    status: (typeof USER_NOTIFICATION_STATUS)[keyof typeof USER_NOTIFICATION_STATUS],
  ): Promise<void> {
    await this.userNotificationModel.updateMany({ notificationId, username: { $in: usernames } }, { $set: { status } });
  }

  async getInboxNotifications(
    username: string,
    limit = 20,
    offset = 0,
  ): Promise<{ notifications: NotificationDocument[]; total: number }> {
    const userNotifications = await this.userNotificationModel
      .find({ username, deletedAt: null })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate<{ notificationId: NotificationDocument }>('notificationId')
      .exec();

    const total = await this.userNotificationModel.countDocuments({ username, deletedAt: null });

    const notifications = userNotifications
      .map((un) => un.notificationId)
      .filter((n): n is NotificationDocument => n !== null);

    return { notifications, total };
  }

  async getUnreadCount(username: string): Promise<number> {
    return this.userNotificationModel.countDocuments({ username, readAt: null, deletedAt: null });
  }

  async markAsRead(notificationId: string, username: string): Promise<void> {
    await this.userNotificationModel.updateOne(
      { notificationId: new Types.ObjectId(notificationId), username },
      { $set: { readAt: new Date() } },
    );
  }

  async markAllAsRead(username: string): Promise<void> {
    await this.userNotificationModel.updateMany(
      { username, readAt: null, deletedAt: null },
      { $set: { readAt: new Date() } },
    );
  }

  async deleteUserNotification(notificationId: string, username: string): Promise<void> {
    await this.userNotificationModel.updateOne(
      { notificationId: new Types.ObjectId(notificationId), username },
      { $set: { deletedAt: new Date() } },
    );
  }

  async deleteNotificationsBySource(sourceType: string, sourceId: string): Promise<void> {
    const notifications = await this.notificationModel.find({
      sourceType,
      sourceId,
    });

    const notificationIds = notifications.map((n) => new Types.ObjectId(String(n.id)));

    await this.userNotificationModel.deleteMany({ notificationId: { $in: notificationIds } });
    await this.notificationModel.deleteMany({ _id: { $in: notificationIds } });
  }
}

export default NotificationsService;
