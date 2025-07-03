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

import { Queue, type QueueOptions, Worker } from 'bullmq';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import QUEUE_CONSTANTS from '@libs/queue/constants/queueConstants';
import JOB_NAMES from '@libs/queue/constants/jobNames';
import UsersService from '../users.service';

@Injectable()
class UsersCacheQueue implements OnModuleInit, OnModuleDestroy {
  private queue: Queue;

  private worker: Worker;

  private readonly redisHost = process.env.REDIS_HOST ?? 'localhost';

  private readonly redisPort = +(process.env.REDIS_PORT ?? 6379);

  constructor(private readonly usersService: UsersService) {}

  onModuleInit() {
    const options: QueueOptions = {
      connection: {
        host: this.redisHost,
        port: this.redisPort,
      },
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    };

    this.queue = new Queue(QUEUE_CONSTANTS.USERS_CACHE_REFRESH, options);

    this.worker = new Worker(
      QUEUE_CONSTANTS.USERS_CACHE_REFRESH,
      async () => {
        await this.usersService.refreshUsersCache();
      },
      {
        connection: {
          host: this.redisHost,
          port: this.redisPort,
        },
        limiter: {
          max: 1,
          duration: 2 * 60 * 1000,
        },
      },
    );
  }

  async onModuleDestroy() {
    await this.worker.close();
    await this.queue.close();
  }

  @OnEvent(QUEUE_CONSTANTS.USERS_CACHE_REFRESH)
  public async scheduleRefresh(): Promise<void> {
    await this.queue.add(JOB_NAMES.REFRESH_USERS_IN_CACHE, {}, { jobId: JOB_NAMES.REFRESH_USERS_IN_CACHE });
  }
}

export default UsersCacheQueue;
