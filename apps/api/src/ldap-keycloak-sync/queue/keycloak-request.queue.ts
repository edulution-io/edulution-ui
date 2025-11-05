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
import { AxiosError, AxiosRequestConfig } from 'axios';
import { HttpMethods } from '@libs/common/types/http-methods';
import { KeycloakJobData } from '@libs/ldapKeycloakSync/types/keycloakJobData';
import QUEUE_CONSTANTS from '@libs/queue/constants/queueConstants';
import sleep from '@libs/common/utils/sleep';
import getKeycloakToken from '../../scripts/keycloak/utilities/getKeycloakToken';
import createKeycloakAxiosClient from '../../scripts/keycloak/utilities/createKeycloakAxiosClient';
import redisConnection from '../../common/redis.connection';

@Injectable()
export default class KeycloakRequestQueue implements OnModuleInit, OnModuleDestroy {
  private queue: Queue;

  private queueEvents: QueueEvents;

  private worker: Worker<KeycloakJobData, unknown>;

  private axiosClient = createKeycloakAxiosClient('');

  async onModuleInit() {
    this.queue = new Queue(QUEUE_CONSTANTS.KEYCLOAK_REQUESTS_QUEUE, { connection: redisConnection });
    this.queue.setMaxListeners(0);
    this.queueEvents = new QueueEvents(QUEUE_CONSTANTS.KEYCLOAK_REQUESTS_QUEUE, { connection: redisConnection });
    await this.queueEvents.waitUntilReady();

    this.worker = new Worker<KeycloakJobData, unknown>(
      QUEUE_CONSTANTS.KEYCLOAK_REQUESTS_QUEUE,
      (job) => this.handleJob(job),
      { connection: redisConnection, concurrency: 20, autorun: false },
    );

    void this.bootstrapKeycloakClientWithRetry();
  }

  private resolveReady!: () => void;

  private whenReady: Promise<void> = new Promise<void>((res) => {
    this.resolveReady = res;
  });

  private async handleJob(job: Job<KeycloakJobData>) {
    await this.whenReady;

    const { method, endpoint, payload, config } = job.data;
    try {
      const res = await this.axiosClient[method](endpoint, payload, config);

      Logger.verbose(
        `Request succeeded: ${method.toUpperCase()} ${endpoint} (status ${res.status})`,
        KeycloakRequestQueue.name,
      );

      return res.data as unknown;
    } catch (err) {
      const e = err as AxiosError;

      if (!e.response || e.response.status === 401 || e.response.status === 403) {
        Logger.verbose(
          `Request failed (${e.response?.status ?? 'no-response'}). Reinitializing token…`,
          KeycloakRequestQueue.name,
        );

        await this.initKeycloakClient();

        const retry = await this.axiosClient[method](endpoint, payload, config);

        Logger.verbose(
          `Request succeeded on retry: ${method.toUpperCase()} ${endpoint} (status ${retry.status})`,
          KeycloakRequestQueue.name,
        );

        return retry.data as unknown;
      }
      throw err;
    }
  }

  private async bootstrapKeycloakClientWithRetry(delay = 5_000, maxDelay = 60_000): Promise<void> {
    try {
      await this.initKeycloakClient();

      this.resolveReady();

      Logger.debug('Keycloak client initialized ✔', KeycloakRequestQueue.name);

      void this.worker.run();
    } catch (e) {
      Logger.debug(
        `Keycloak not reachable (${(e as Error).message}). Retrying in ${delay / 1000}s…`,
        KeycloakRequestQueue.name,
      );
      await sleep(delay);
      await this.bootstrapKeycloakClientWithRetry(Math.min(delay * 2, maxDelay), maxDelay);
    }
  }

  private async initKeycloakClient() {
    const token = await getKeycloakToken();
    this.axiosClient = createKeycloakAxiosClient(token);
  }

  private readonly jobRetryDelay = 3000;

  private readonly jobTimeout = 120000;

  public async enqueue<T>(
    method: HttpMethods.GET | HttpMethods.POST | HttpMethods.PUT | HttpMethods.DELETE,
    endpoint: string,
    payload?: { name: string },
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const job = await this.queue.add(
      QUEUE_CONSTANTS.KEYCLOAK_REQUESTS_QUEUE,
      { method, endpoint, payload, config },
      {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: { type: 'exponential', delay: this.jobRetryDelay },
      },
    );

    return (await job.waitUntilFinished(this.queueEvents, this.jobTimeout)) as T;
  }

  public async fetchAllPaginated<T>(
    path: string,
    baseQuery = '',
    pageSize = 100,
    first = 0,
    acc: T[] = [],
  ): Promise<T[]> {
    const results: T[] = acc.length > 0 ? acc : [];
    let currentFirst = first;
    let totalFetched = acc.length;
    let hasMorePages = true;

    while (hasMorePages) {
      const qp = baseQuery
        ? `${baseQuery}&first=${currentFirst}&max=${pageSize}`
        : `first=${currentFirst}&max=${pageSize}`;
      const endpoint = `${path.startsWith('/') ? path : `/${path}`}${qp ? `?${qp}` : ''}`;

      if (currentFirst % 500 === 0 && currentFirst > 0) {
        Logger.debug(
          `Fetching paginated data: ${path}, total fetched so far: ${totalFetched}`,
          KeycloakRequestQueue.name,
        );
      }

      let batch: T[];
      try {
        // eslint-disable-next-line no-await-in-loop
        batch = await this.enqueue<T[]>(HttpMethods.GET, endpoint);
      } catch (error) {
        Logger.error(`Failed to fetch page at offset ${currentFirst} for ${path}:`, error, KeycloakRequestQueue.name);
        throw error;
      }

      if (!batch || batch.length === 0) {
        Logger.debug(`Pagination complete for ${path}, total items: ${totalFetched}`, KeycloakRequestQueue.name);
        hasMorePages = false;
        break;
      }

      results.push(...batch);
      totalFetched += batch.length;

      if (batch.length < pageSize) {
        Logger.debug(`Pagination complete for ${path}, total items: ${totalFetched}`, KeycloakRequestQueue.name);
        hasMorePages = false;
      } else {
        currentFirst += pageSize;
      }
    }

    return results;
  }

  async onModuleDestroy() {
    await this.worker.close();
    await this.queue.close();
    await this.queueEvents.close();
  }
}
