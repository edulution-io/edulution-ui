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
import { Job, Queue, QueueEvents, Worker } from 'bullmq';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Agent as HttpsAgent } from 'https';
import { HttpMethods } from '@libs/common/types/http-methods';
import QUEUE_CONSTANTS from '@libs/queue/constants/queueConstants';
import LmnApiJobData from '@libs/lmnApi/types/lmnApiJobData';
import LmnApiJobResult from '@libs/lmnApi/types/lmn-api-job.result';
import redisConnection from '../../common/redis.connection';

@Injectable()
class LmnApiRequestQueue implements OnModuleInit, OnModuleDestroy {
  private queue: Queue;

  private queueEvents: QueueEvents;

  private worker: Worker<LmnApiJobData, unknown>;

  private axiosClient: AxiosInstance;

  private readonly timeoutMs = +(process.env.LMN_API_TIMEOUT_MS ?? 15000);

  private readonly retryDelayMs = 1000;

  async onModuleInit() {
    this.queue = new Queue(QUEUE_CONSTANTS.LMN_API_REQUESTS_QUEUE, { connection: redisConnection });
    this.queue.setMaxListeners(0);
    this.queueEvents = new QueueEvents(QUEUE_CONSTANTS.LMN_API_REQUESTS_QUEUE, { connection: redisConnection });
    await this.queueEvents.waitUntilReady();

    const httpsAgent = new HttpsAgent({ rejectUnauthorized: false });

    this.axiosClient = axios.create({
      baseURL: process.env.LMN_API_BASE_URL,
      httpsAgent,
      timeout: this.timeoutMs,
    });

    this.worker = new Worker<LmnApiJobData, unknown>(
      QUEUE_CONSTANTS.LMN_API_REQUESTS_QUEUE,
      (job) => this.handleJob(job),
      { connection: redisConnection, concurrency: 10 },
    );

    Logger.debug('LMN API request queue initialized', LmnApiRequestQueue.name);
  }

  private async handleJob<T>(job: Job<LmnApiJobData>): Promise<LmnApiJobResult<T>> {
    const { method, endpoint, payload, config } = job.data;

    const requestConfig: AxiosRequestConfig = {
      ...config,
      method,
      url: endpoint,
      timeout: config?.timeout ?? this.timeoutMs,
    };

    if (payload !== undefined) {
      requestConfig.data = payload;
    }

    const response = await this.axiosClient.request<T>(requestConfig);
    const responseData =
      response.data instanceof ArrayBuffer ? Buffer.from(response.data) : (response.data as unknown as T);

    return {
      data: responseData as T,
      headers: response.headers ?? {},
      status: response.status,
    };
  }

  public async enqueue<T>(
    method: HttpMethods,
    endpoint: string,
    payload?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<LmnApiJobResult<T>> {
    const job = await this.queue.add(
      QUEUE_CONSTANTS.LMN_API_REQUESTS_QUEUE,
      { method, endpoint, payload, config },
      {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: { type: 'exponential', delay: this.retryDelayMs },
      },
    );

    const result = (await job.waitUntilFinished(this.queueEvents)) as LmnApiJobResult<T>;

    return result;
  }

  async onModuleDestroy() {
    await this.worker?.close();
    await this.queue?.close();
    await this.queueEvents?.close();
  }
}

export default LmnApiRequestQueue;
