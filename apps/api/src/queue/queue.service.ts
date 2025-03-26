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

import { Injectable } from '@nestjs/common';
import {Job, Queue, Worker} from 'bullmq';
import process from "node:process";
import JOB_NAMES from "@libs/queue/constants/jobNames";
import JobData from "@libs/queue/constants/jobData";
import DuplicateFileConsumer from "../filesharing/consumers/duplicateFile.consumer";
import CollectFileConsumer from "../filesharing/consumers/collectFile.consumer";

@Injectable()
class DynamicQueueService {

  private workers = new Map<string, Worker>();

  private queues = new Map<string, Queue>();

  private redisHost = process.env.REDIS_HOST ?? 'localhost';

  private redisPort = +(process.env.REDIS_PORT ?? 6379);

  constructor(
    private readonly duplicateFileConsumer: DuplicateFileConsumer,
    private readonly collectFileConsumer: CollectFileConsumer
  ) {}


  createWorkerForUser(userId: string): Worker {
    const queueName = `queue-user-${userId}`;
    if (this.workers.has(userId)) {
      return <Worker<JobData>>this.workers.get(userId);
    }

    const worker = new Worker(
      queueName,
      async (job: Job<JobData>) => {
        await this.handleJob(job);
      },
      {
        connection: {
          host: this.redisHost,
          port: this.redisPort,
        },
      },
    );

    this.workers.set(userId, worker);
    return worker;
  }

  getQueue(userId: string): Queue | undefined {
    if (!this.queues.has(userId)) {
      const queue = new Queue(`queue-user-${userId}`, {
        connection: {
          host: this.redisHost,
          port: this.redisPort,
        },
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

  async addJobForUser(userId: string, jobName: string, data: JobData): Promise<void> {
    this.createWorkerForUser(userId);

    const queue = this.getOrCreateQueueForUser(userId);
    await queue.add(jobName, data);
  }


  async handleJob(job: Job<JobData>): Promise<void> {
    switch (job.name) {
      case JOB_NAMES.COLLECT_FILE_JOB:
        await this.collectFileConsumer.process(job);
        break;
      case JOB_NAMES.DUPLICATE_FILE_JOB:
        await this.duplicateFileConsumer.process(job);
        break;
      default:
    }
  }
}

export default DynamicQueueService;