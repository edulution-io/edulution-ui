
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import process from 'node:process';

@Injectable()
export class QueueProvider {
  private queues = new Map<string, Queue>();

  private redisHost = process.env.REDIS_HOST ?? 'localhost';
  private redisPort = +(process.env.REDIS_PORT ?? 6379);

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
}
