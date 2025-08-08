/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { Injectable } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import pickDefinedNotificationFields from '@libs/notification/utils/pickDefinedNotificationFields';
import SendPushNotificationDto from '@libs/notification/types/send-pushNotification.dto';
import UsersService from '../users/users.service';

@Injectable()
export class NotificationsService {
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
