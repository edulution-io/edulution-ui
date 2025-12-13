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

import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import pickDefinedNotificationFields from '@libs/notification/utils/pickDefinedNotificationFields';
import SendPushNotificationDto from '@libs/notification/types/send-pushNotification.dto';
import NotificationType from '@libs/notification/types/notificationType';
import CreateNotificationDto from '@libs/notification/types/createNotificationDto';
import notificationsErrorMessages from '@libs/notification/constants/notificationsErrorMessages';
import UsersService from '../users/users.service';
import { Notification, NotificationDocument } from './notifications.schema';
import CustomHttpException from '../common/CustomHttpException';

@Injectable()
class NotificationsService {
  private readonly expo = new Expo();

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private userService: UsersService,
  ) {}

  async getByUsername(username: string, options: { limit: number; offset: number }): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ recipientUsername: username })
      .sort({ createdAt: -1 })
      .skip(options.offset)
      .limit(options.limit)
      .exec();
  }

  async getById(username: string, id: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel.findOne({
      _id: id,
      recipientUsername: username,
    });

    if (!notification) {
      throw new CustomHttpException(
        notificationsErrorMessages.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        undefined,
        NotificationsService.name,
      );
    }

    return notification;
  }

  async delete(username: string, id: string): Promise<void> {
    const result = await this.notificationModel.deleteOne({
      _id: id,
      recipientUsername: username,
    });

    if (result.deletedCount === 0) {
      throw new CustomHttpException(
        notificationsErrorMessages.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        undefined,
        NotificationsService.name,
      );
    }
  }

  async sendToUsernames(usernames: string[], notificationData: CreateNotificationDto) {
    const notifications = usernames.map((username) => ({
      ...notificationData,
      recipientUsername: username,
    }));
    const savedNotifications = await this.notificationModel.insertMany(notifications);

    if (notificationData.type === NotificationType.PUSH) {
      const tokens = await this.userService.getPushTokensByUsersnames(usernames);

      if (tokens.length > 0) {
        await this.sendPush({
          to: tokens,
          title: notificationData.title,
          body: notificationData.body,
          subtitle: notificationData.subtitle,
          data: notificationData.data,
          sound: notificationData.sound,
          badge: notificationData.badge,
          priority: notificationData.priority,
          categoryId: notificationData.categoryId,
        });
      }
    }

    return savedNotifications;
  }

  private async sendPush(sendPushNotificationDto: SendPushNotificationDto): Promise<void> {
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
}

export default NotificationsService;
