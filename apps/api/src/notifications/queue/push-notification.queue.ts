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
        removeOnFail: 100,
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
      },
    });

    this.worker = new Worker<PushNotificationJobData, void>(
      QUEUE_CONSTANTS.PUSH_NOTIFICATION_QUEUE,
      (job) => this.handleJob(job),
      { connection: redisConnection, concurrency: WORKER_CONFIG.PUSH_NOTIFICATION_CONCURRENCY },
    );

    this.worker.on('completed', (job) => {
      Logger.debug(`Job ${job.id} completed`, PushNotificationQueue.name);
    });

    this.worker.on('failed', (job, error) => {
      Logger.error(`Job ${job?.id} failed: ${error.message}`, error.stack, PushNotificationQueue.name);
    });

    Logger.log('Push notification queue initialized', PushNotificationQueue.name);
  }

  private static mapToExpoMessage(
    token: string,
    data: Omit<PushNotificationJobData, 'username' | 'to'>,
  ): ExpoPushMessage {
    return {
      to: token,
      ...pickDefinedNotificationFields({
        _contentAvailable: data.contentAvailable,
        data: data.data,
        title: data.title,
        body: data.body,
        ttl: data.ttl,
        expiration: data.expiration,
        priority: data.priority,
        subtitle: data.subtitle,
        sound: data.sound,
        badge: data.badge,
        interruptionLevel: data.interruptionLevel,
        channelId: data.channelId,
        icon: data.icon,
        richContent: data.richContent,
        categoryId: data.categoryId,
        mutableContent: data.mutableContent,
        accessToken: data.accessToken,
      }),
    };
  }

  private async handleJob(job: Job<PushNotificationJobData>): Promise<void> {
    const { username, to, ...notificationData } = job.data;
    const tokens = Array.isArray(to) ? to : [to];

    const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));

    if (validTokens.length !== tokens.length) {
      Logger.warn(`Filtered ${tokens.length - validTokens.length} invalid tokens`, PushNotificationQueue.name);
    }

    if (validTokens.length === 0) {
      Logger.warn(`No valid tokens for job ${job.id}, skipping`, PushNotificationQueue.name);
      return;
    }

    Logger.log(
      `Sending push | devices: ${validTokens.length} | title: "${notificationData.title}" | user: ${username}`,
      PushNotificationQueue.name,
    );

    const messages = validTokens.map((token) => PushNotificationQueue.mapToExpoMessage(token, notificationData));

    const chunks = this.expo.chunkPushNotifications(messages);

    const results = await Promise.allSettled(
      chunks.map((chunk, index) =>
        this.expo.sendPushNotificationsAsync(chunk).catch((error) => {
          Logger.error(
            `Chunk ${index + 1}/${chunks.length} failed`,
            error instanceof Error ? error.stack : undefined,
            PushNotificationQueue.name,
          );
          throw error;
        }),
      ),
    );

    const failedCount = results.filter((r) => r.status === 'rejected').length;
    if (failedCount > 0) {
      throw new Error(`${failedCount}/${chunks.length} chunks failed`);
    }
  }

  public async enqueue(data: PushNotificationJobData): Promise<void> {
    await this.queue.add(JOB_NAMES.SEND_PUSH_NOTIFICATION_JOB, data);
  }

  async onModuleDestroy() {
    await this.worker.close();
    await this.queue.close();
  }
}
