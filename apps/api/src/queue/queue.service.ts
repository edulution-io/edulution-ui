import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueProvider } from './queue.provider';
import { WorkerService } from './worker.service';

@Injectable()
export class DynamicQueueService {
  constructor(
    private readonly queueProvider: QueueProvider,
    private readonly workerService: WorkerService,
  ) {}

  getOrCreateQueueForUser(userId: string): Queue {
    const queue = this.queueProvider.getQueue(userId);
    return queue as Queue;
  }

  async addJobForUser(userId: string, jobName: string, data: any): Promise<void> {
    this.workerService.createWorkerForUser(userId);

    const queue = this.getOrCreateQueueForUser(userId);
    await queue.add(jobName, data);
  }
}