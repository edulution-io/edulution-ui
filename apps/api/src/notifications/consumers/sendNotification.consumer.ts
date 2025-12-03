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
