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

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, Queue, QueueEvents, Worker } from 'bullmq';
import QUEUE_CONSTANTS from '@libs/queue/constants/queueConstants';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { HttpMethods } from '@libs/common/types/http-methods';
import { KeycloakJobData } from '@libs/ldapKeycloakSync/types/keycloakJobData';
import getKeycloakToken from '../../scripts/keycloak/utilities/getKeycloakToken';
import createKeycloakAxiosClient from '../../scripts/keycloak/utilities/createKeycloakAxiosClient';
import redisConnection from '../../common/redis.connection';

const QUEUE_NAME = QUEUE_CONSTANTS.KEYCLOAK_REQUESTS_QUEUE;

@Injectable()
export default class KeycloakRequestQueue implements OnModuleInit, OnModuleDestroy {
  private queue: Queue;

  private queueEvents: QueueEvents;

  private worker: Worker;

  private axiosClient = createKeycloakAxiosClient('');

  async onModuleInit() {
    this.queue = new Queue(QUEUE_NAME, { connection: redisConnection });
    this.queue.setMaxListeners(0);
    this.queueEvents = new QueueEvents(QUEUE_NAME, { connection: redisConnection });

    await this.initKeycloakClient();

    this.worker = new Worker<KeycloakJobData, unknown>(
      QUEUE_NAME,
      async (job: Job<KeycloakJobData>) => {
        const { method, endpoint, payload, config } = job.data;

        try {
          const response = await this.axiosClient[method](endpoint, payload, config);
          return response.data as unknown;
        } catch (error) {
          if ((error as AxiosError)?.response?.status) {
            await this.initKeycloakClient();

            const retryResponse = await this.axiosClient[method](endpoint, payload, config);
            return retryResponse.data as unknown;
          }

          throw error;
        }
      },
      {
        connection: redisConnection,
        concurrency: 20,
      },
    );
  }

  private async initKeycloakClient() {
    const token = await getKeycloakToken();
    this.axiosClient = createKeycloakAxiosClient(token);
  }

  public async enqueue<T>(
    method: HttpMethods.GET | HttpMethods.POST | HttpMethods.PUT | HttpMethods.DELETE,
    endpoint: string,
    payload?: { name: string },
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const job = await this.queue.add(
      QUEUE_NAME,
      { method, endpoint, payload, config },
      { removeOnComplete: true, removeOnFail: true, attempts: 3 },
    );

    return (await job.waitUntilFinished(this.queueEvents)) as T;
  }

  async onModuleDestroy() {
    await this.worker.close();
    await this.queue.close();
    await this.queueEvents.close();
  }
}
