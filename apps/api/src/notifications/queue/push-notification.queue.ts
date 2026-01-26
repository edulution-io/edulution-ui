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

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, Queue, Worker } from 'bullmq';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import pickDefinedNotificationFields from '@libs/notification/utils/pickDefinedNotificationFields';
import PushNotificationJobData from '@libs/queue/types/pushNotificationJobData';
import QUEUE_CONSTANTS from '@libs/queue/constants/queueConstants';
import JOB_NAMES from '@libs/queue/constants/jobNames';
import WORKER_CONFIG from '@libs/queue/constants/workerConfig';
import redisConnection from '../../common/redis.connection';

@Injectable()
export default class PushNotificationQueue implements OnModuleInit, OnModuleDestroy {
  private queue: Queue;

  private worker: Worker<PushNotificationJobData, void>;

  private readonly expo = new Expo();

  onModuleInit() {
    this.queue = new Queue(QUEUE_CONSTANTS.PUSH_NOTIFICATION_QUEUE, {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
      },
    });

    this.worker = new Worker<PushNotificationJobData, void>(
      QUEUE_CONSTANTS.PUSH_NOTIFICATION_QUEUE,
      (job) => this.handleJob(job),
      { connection: redisConnection, concurrency: WORKER_CONFIG.PUSH_NOTIFICATION_CONCURRENCY },
    );

    Logger.log('Push notification queue initialized', PushNotificationQueue.name);
  }

  private async handleJob(job: Job<PushNotificationJobData>): Promise<void> {
    const { username, ...notificationData } = job.data;

    const tokens = Array.isArray(notificationData.to) ? notificationData.to : [notificationData.to];

    const messages: ExpoPushMessage[] = tokens.map((token: string) => ({
      to: token,
      ...pickDefinedNotificationFields({
        _contentAvailable: notificationData.contentAvailable,
        data: notificationData.data,
        title: notificationData.title,
        body: notificationData.body,
        ttl: notificationData.ttl,
        expiration: notificationData.expiration,
        priority: notificationData.priority,
        subtitle: notificationData.subtitle,
        sound: notificationData.sound,
        badge: notificationData.badge,
        interruptionLevel: notificationData.interruptionLevel,
        channelId: notificationData.channelId,
        icon: notificationData.icon,
        richContent: notificationData.richContent,
        categoryId: notificationData.categoryId,
        mutableContent: notificationData.mutableContent,
        accessToken: notificationData.accessToken,
      }),
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    await Promise.all(chunks.map((chunk) => this.expo.sendPushNotificationsAsync(chunk)));

    Logger.verbose(
      `Push notification sent to ${tokens.length} recipients (triggered by ${username})`,
      PushNotificationQueue.name,
    );
  }

  public async enqueue(data: PushNotificationJobData): Promise<void> {
    await this.queue.add(JOB_NAMES.SEND_PUSH_NOTIFICATION_JOB, data);
  }

  async onModuleDestroy() {
    await this.worker.close();
    await this.queue.close();
  }
}
