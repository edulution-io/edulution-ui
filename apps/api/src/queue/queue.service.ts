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

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import JOB_NAMES from '@libs/queue/constants/jobNames';
import FileOperationQueueJobData from '@libs/queue/constants/fileOperationQueueJobData';
import QUEUE_CONSTANTS from '@libs/queue/constants/queueConstants';
import NotificationJobData from '@libs/queue/types/notificationJobData';
import pickDefinedNotificationFields from '@libs/notification/utils/pickDefinedNotificationFields';
import DuplicateFileConsumer from '../filesharing/consumers/duplicateFile.consumer';
import CollectFileConsumer from '../filesharing/consumers/collectFile.consumer';
import DeleteFileConsumer from '../filesharing/consumers/deleteFile.consumer';
import MoveOrRenameConsumer from '../filesharing/consumers/moveOrRename.consumer';
import CopyFileConsumer from '../filesharing/consumers/copyFile.consumer';
import CreateFolderConsumer from '../filesharing/consumers/createFolder.consumer';
import redisConnection from '../common/redis.connection';
import UsersService from '../users/users.service';
import AiService from '../ai/ai.service';

@Injectable()
class QueueService implements OnModuleInit, OnModuleDestroy {
  private workers = new Map<string, Worker>();

  private queues = new Map<string, Queue>();

  private notificationQueue: Queue;

  private notificationWorker: Worker;

  private readonly expo = new Expo();

  constructor(
    private readonly duplicateFileConsumer: DuplicateFileConsumer,
    private readonly collectFileConsumer: CollectFileConsumer,
    private readonly deleteFileConsumer: DeleteFileConsumer,
    private readonly moveOrRenameFileConsumer: MoveOrRenameConsumer,
    private readonly copyFileConsumer: CopyFileConsumer,
    private readonly createFolderConsumer: CreateFolderConsumer,
    private readonly usersService: UsersService,
    private readonly aiService: AiService,
  ) {}

  async onModuleInit() {
    const redis = new Redis(redisConnection);
    const userIds = await this.scanUserIds(redis, QUEUE_CONSTANTS.PREFIX);
    await redis.quit();

    await Promise.all(
      userIds.map((userId) => {
        const queue = this.getOrCreateQueueForUser(userId);
        return queue.obliterate({ force: true });
      }),
    );

    this.notificationQueue = new Queue(QUEUE_CONSTANTS.NOTIFICATION_QUEUE, {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: 100,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });

    this.notificationWorker = new Worker(
      QUEUE_CONSTANTS.NOTIFICATION_QUEUE,
      async (job: Job<NotificationJobData>) => {
        await this.handleNotificationJob(job);
      },
      {
        connection: redisConnection,
        concurrency: 5,
      },
    );

    this.notificationWorker.on('failed', (job, err) => {
      console.error(`Notification job ${job?.id} failed:`, err);
    });
  }

  async onModuleDestroy() {
    await this.notificationWorker?.close();
    await this.notificationQueue?.close();
  }

  createWorkerForUser(userId: string): Worker {
    const queueName = QUEUE_CONSTANTS.PREFIX + userId;
    if (this.workers.has(userId)) {
      return <Worker<FileOperationQueueJobData>>this.workers.get(userId);
    }

    const worker = new Worker(
      queueName,
      async (job: Job<FileOperationQueueJobData>) => {
        await this.handleJob(job);
      },
      {
        connection: redisConnection,
      },
    );

    this.workers.set(userId, worker);
    return worker;
  }

  getQueue(userId: string): Queue | undefined {
    const queueName = QUEUE_CONSTANTS.PREFIX + userId;
    if (!this.queues.has(userId)) {
      const queue = new Queue(queueName, {
        connection: redisConnection,
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: true,
        },
      });
      this.queues.set(userId, queue);
    }
    return this.queues.get(userId);
  }

  getOrCreateQueueForUser(userId: string): Queue {
    const queue = this.getQueue(userId);
    return queue as Queue;
  }

  async addJobForUser(userId: string, jobName: string, data: FileOperationQueueJobData): Promise<void> {
    this.createWorkerForUser(userId);
    const queue = this.getOrCreateQueueForUser(userId);
    await queue.add(jobName, data);
  }

  async handleJob(job: Job<FileOperationQueueJobData>): Promise<void> {
    switch (job.name) {
      case JOB_NAMES.COLLECT_FILE_JOB:
        await this.collectFileConsumer.process(job);
        break;
      case JOB_NAMES.DUPLICATE_FILE_JOB:
        await this.duplicateFileConsumer.process(job);
        break;
      case JOB_NAMES.DELETE_FILE_JOB:
        await this.deleteFileConsumer.process(job);
        break;
      case JOB_NAMES.MOVE_OR_RENAME_JOB:
        await this.moveOrRenameFileConsumer.process(job);
        break;
      case JOB_NAMES.COPY_FILE_JOB:
        await this.copyFileConsumer.process(job);
        break;
      case JOB_NAMES.CREATE_FOLDER_JOB:
        await this.createFolderConsumer.process(job);
        break;
      default:
    }
  }

  async addNotificationJob(data: NotificationJobData): Promise<void> {
    await this.notificationQueue.add(JOB_NAMES.SEND_NOTIFICATION_JOB, data);
  }

  private async handleNotificationJob(job: Job<NotificationJobData>): Promise<void> {
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

          if (tokens.length > 0) {
            await this.sendPushNotification({
              to: tokens,
              ...partialNotification,
              ...translated,
            });
          }
        }),
      );
    } else {
      const tokens = await this.usersService.getPushTokensByUsersnames(usernames);

      if (tokens.length > 0) {
        await this.sendPushNotification({
          to: tokens,
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

  private async scanUserIds(
    redis: Redis,
    queuePrefix: string,
    cursor = '0',
    userIds = new Set<string>(),
  ): Promise<string[]> {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `bull:${queuePrefix}*`, 'COUNT', 100);

    keys.forEach((key) => {
      if (key.startsWith(`bull:${queuePrefix}`)) {
        const queueNamePlusSuffix = key.slice('bull:'.length);
        const [queueName] = queueNamePlusSuffix.split(':');
        const userId = queueName.replace(queuePrefix, '');
        userIds.add(userId);
      }
    });

    if (nextCursor === '0') {
      return Array.from(userIds);
    }
    return this.scanUserIds(redis, queuePrefix, nextCursor, userIds);
  }
}

export default QueueService;
