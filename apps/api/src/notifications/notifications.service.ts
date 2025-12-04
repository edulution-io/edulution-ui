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

import { Injectable } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import pickDefinedNotificationFields from '@libs/notification/utils/pickDefinedNotificationFields';
import SendPushNotificationDto from '@libs/notification/types/send-pushNotification.dto';
import UsersService from '../users/users.service';

@Injectable()
class NotificationsService {
  private readonly expo = new Expo();

  constructor(private userService: UsersService) {}

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

  async notifyUsernames(usernames: string[], partialNotification: Omit<SendPushNotificationDto, 'to'>): Promise<void> {
    const uniqueTokens = await this.userService.getPushTokensByUsersnames(usernames);
    await this.sendPushNotification({
      to: uniqueTokens,
      ...partialNotification,
    });
  }
}

export default NotificationsService;
