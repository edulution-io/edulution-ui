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
import { Job } from 'bullmq';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import NotificationJobData from '@libs/queue/types/notificationJobData';
import pickDefinedNotificationFields from '@libs/notification/utils/pickDefinedNotificationFields';
import UsersService from '../../users/users.service';
import AiService from '../../ai/ai.service';

@Injectable()
class SendNotificationConsumer {
  private readonly expo = new Expo();

  constructor(
    private readonly usersService: UsersService,
    private readonly aiService: AiService,
  ) {}

  async process(job: Job<NotificationJobData>): Promise<void> {
    const { usernames, notification } = job.data;
    const { translate, ...partialNotification } = notification;

    if (translate) {
      const usersWithLanguage = await Promise.all(
        usernames.map(async (username) => {
          const user = await this.usersService.findOne(username);
          return { username, language: user?.language || 'DE' };
        }),
      );

      const usersByLanguage = usersWithLanguage.reduce((acc, { username, language }) => {
        if (!acc.has(language)) {
          acc.set(language, []);
        }
        acc.get(language)!.push(username);
        return acc;
      }, new Map<string, string[]>());
      await Promise.all(
        Array.from(usersByLanguage.entries()).map(async ([language, users]) => {
          const translated =
            language === 'EN'
              ? { title: partialNotification.title, body: partialNotification.body }
              : await this.aiService.translateNotification(
                  { title: partialNotification.title ?? '', body: partialNotification.body ?? '' },
                  language,
                );

          const tokens = await this.usersService.getPushTokensByUsersnames(users);
          const uniqueTokens = [...new Set(tokens)];

          if (uniqueTokens.length > 0) {
            await this.sendPushNotification({
              to: uniqueTokens,
              ...partialNotification,
              ...translated,
            });
          }
        }),
      );
    } else {
      const tokens = await this.usersService.getPushTokensByUsersnames(usernames);
      const uniqueTokens = [...new Set(tokens)];

      if (uniqueTokens.length > 0) {
        await this.sendPushNotification({
          to: uniqueTokens,
          ...partialNotification,
        });
      }
    }
  }

  private async sendPushNotification(dto: { to: string | string[]; [key: string]: unknown }): Promise<void> {
    const tokens = Array.isArray(dto.to) ? dto.to : [dto.to];

    const messages: ExpoPushMessage[] = tokens.map((token: string) => ({
      to: token,
      ...pickDefinedNotificationFields(dto),
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    await Promise.all(chunks.map((chunk) => this.expo.sendPushNotificationsAsync(chunk)));
  }
}

export default SendNotificationConsumer;
