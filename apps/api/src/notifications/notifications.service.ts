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
import { Model } from 'mongoose';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import pickDefinedNotificationFields from '@libs/notification/utils/pickDefinedNotificationFields';
import SendPushNotificationDto from '@libs/notification/types/send-pushNotification.dto';
import CreateNotificationDto from '@libs/notification/types/createNotification.dto';
import InboxNotificationDto from '@libs/notification/types/inboxNotification.dto';
import USER_NOTIFICATION_STATUS from '@libs/notification/constants/userNotificationStatus';
import NOTIFICATION_TYPE from '@libs/notification/constants/notificationType';
import { NOTIFICATION_FILTER_TYPE, NotificationFilterType } from '@libs/notification/types/notificationFilterType';
import { randomUUID } from 'crypto';
import UsersService from '../users/users.service';
import { Notification, NotificationDocument } from './notification.schema';
import { UserNotification, UserNotificationDocument } from './userNotification.schema';

type InboxNotification = InboxNotificationDto;

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
    let notificationId: string | null = null;

    if (persistOptions) {
      const notification = await this.createNotification(persistOptions);
      notificationId = notification.notificationId;
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
    return this.notificationModel.create({
      ...createNotificationDto,
      notificationId: randomUUID(),
    });
  }

  async createUserNotifications(notificationId: string, usernames: string[]): Promise<UserNotificationDocument[]> {
    const userNotifications = usernames.map((username) => ({
      userNotificationId: randomUUID(),
      notificationId,
      username,
      readAt: null,
      status: USER_NOTIFICATION_STATUS.PENDING,
    }));
    return this.userNotificationModel.insertMany(userNotifications);
  }

  async updateUserNotificationStatus(
    notificationId: string,
    usernames: string[],
    status: (typeof USER_NOTIFICATION_STATUS)[keyof typeof USER_NOTIFICATION_STATUS],
  ): Promise<void> {
    await this.userNotificationModel.updateMany({ notificationId, username: { $in: usernames } }, { $set: { status } });
  }

  async getInboxNotifications(
    username: string,
    limit = 20,
    offset = 0,
  ): Promise<{ notifications: InboxNotification[]; total: number }> {
    const result = await this.userNotificationModel.aggregate<{
      data: Array<{
        userNotificationId: string;
        notificationId: string;
        readAt: Date | null;
        notification: Notification;
      }>;
      total: Array<{ count: number }>;
    }>([
      { $match: { username } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'notifications',
          localField: 'notificationId',
          foreignField: 'notificationId',
          as: 'notification',
        },
      },
      { $unwind: '$notification' },
      { $match: { 'notification.createdBy': { $ne: username } } },
      {
        $facet: {
          data: [{ $skip: offset }, { $limit: limit }],
          total: [{ $count: 'count' }],
        },
      },
    ]);

    const data = result[0]?.data ?? [];
    const total = result[0]?.total[0]?.count ?? 0;

    const notifications: InboxNotification[] = data.map((item) => ({
      id: item.userNotificationId,
      notificationId: item.notification.notificationId,
      type: item.notification.type,
      sourceType: item.notification.sourceType,
      sourceId: item.notification.sourceId,
      title: item.notification.title,
      pushNotification: item.notification.pushNotification,
      content: item.notification.content,
      data: item.notification.data,
      createdAt: item.notification.createdAt,
      createdBy: item.notification.createdBy,
      readAt: item.readAt,
    }));

    return { notifications, total };
  }

  async getUnreadCount(username: string): Promise<number> {
    const result = await this.userNotificationModel.aggregate<{ total: number }>([
      { $match: { username, readAt: null } },
      {
        $lookup: {
          from: 'notifications',
          localField: 'notificationId',
          foreignField: 'notificationId',
          as: 'notification',
        },
      },
      { $unwind: '$notification' },
      {
        $match: {
          'notification.type': NOTIFICATION_TYPE.USER,
          'notification.createdBy': { $ne: username },
        },
      },
      { $count: 'total' },
    ]);

    return result[0]?.total ?? 0;
  }

  async markAsRead(notificationId: string, username: string): Promise<void> {
    const notification = await this.notificationModel.findOne({ notificationId }).exec();
    if (!notification || notification.type !== NOTIFICATION_TYPE.USER) {
      return;
    }

    await this.userNotificationModel.updateOne({ notificationId, username }, { $set: { readAt: new Date() } });
  }

  async markAllAsRead(username: string): Promise<void> {
    const userTypeNotificationIds = await this.userNotificationModel.aggregate<{ userNotificationId: string }>([
      { $match: { username, readAt: null } },
      {
        $lookup: {
          from: 'notifications',
          localField: 'notificationId',
          foreignField: 'notificationId',
          as: 'notification',
        },
      },
      { $unwind: '$notification' },
      { $match: { 'notification.type': NOTIFICATION_TYPE.USER } },
      { $project: { userNotificationId: 1 } },
    ]);

    const ids = userTypeNotificationIds.map((doc) => doc.userNotificationId);
    if (ids.length > 0) {
      await this.userNotificationModel.updateMany(
        { userNotificationId: { $in: ids } },
        { $set: { readAt: new Date() } },
      );
    }
  }

  async deleteUserNotification(notificationId: string, username: string): Promise<void> {
    await this.userNotificationModel.deleteOne({ notificationId, username });
  }

  async deleteAllUserNotifications(username: string, type: NotificationFilterType): Promise<number> {
    if (type === NOTIFICATION_FILTER_TYPE.ALL) {
      const result = await this.userNotificationModel.deleteMany({ username });
      return result.deletedCount;
    }

    const notificationIds = await this.userNotificationModel.aggregate<{ notificationId: string }>([
      { $match: { username } },
      {
        $lookup: {
          from: 'notifications',
          localField: 'notificationId',
          foreignField: 'notificationId',
          as: 'notification',
        },
      },
      { $unwind: '$notification' },
      { $match: { 'notification.type': type } },
      { $project: { notificationId: 1 } },
    ]);

    const ids = notificationIds.map((doc) => doc.notificationId);
    if (ids.length === 0) {
      return 0;
    }

    const result = await this.userNotificationModel.deleteMany({
      username,
      notificationId: { $in: ids },
    });
    return result.deletedCount;
  }
}

export default NotificationsService;
