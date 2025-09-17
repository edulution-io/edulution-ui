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

    return (await job.waitUntilFinished(this.queueEvents)) as T;
  }

  async onModuleDestroy() {
    await this.worker.close();
    await this.queue.close();
    await this.queueEvents.close();
  }
}
