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

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Job, Queue, Worker } from 'bullmq';
import JOB_NAMES from '@libs/queue/constants/jobNames';
import FileOperationQueueJobData from '@libs/queue/constants/fileOperationQueueJobData';
import Redis from 'ioredis';
import QUEUE_CONSTANTS from '@libs/queue/constants/queueConstants';
import DuplicateFileConsumer from '../filesharing/consumers/duplicateFile.consumer';
import CollectFileConsumer from '../filesharing/consumers/collectFile.consumer';
import DeleteFileConsumer from '../filesharing/consumers/deleteFile.consumer';
import MoveOrRenameConsumer from '../filesharing/consumers/moveOrRename.consumer';
import CopyFileConsumer from '../filesharing/consumers/copyFile.consumer';
import CreateFolderConsumer from '../filesharing/consumers/createFolder.consumer';
import UploadFileConsumer from '../filesharing/consumers/uploadFile.consumer';
import redisConnection from '../common/redis.connection';

@Injectable()
class QueueService implements OnModuleInit {
  private workers = new Map<string, Worker>();

  private queues = new Map<string, Queue>();

  constructor(
    private readonly duplicateFileConsumer: DuplicateFileConsumer,
    private readonly collectFileConsumer: CollectFileConsumer,
    private readonly deleteFileConsumer: DeleteFileConsumer,
    private readonly moveOrRenameFileConsumer: MoveOrRenameConsumer,
    private readonly copyFileConsumer: CopyFileConsumer,
    private readonly createFolderConsumer: CreateFolderConsumer,
    private readonly uploadFileConsumer: UploadFileConsumer,
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
      case JOB_NAMES.FILE_UPLOAD_JOB:
        await this.uploadFileConsumer.process(job);
        break;
      default:
    }
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
