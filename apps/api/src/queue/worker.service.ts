// worker.service.ts
import { Injectable } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import process from 'node:process';
import { JobHandlerService } from './job.handler.service';

@Injectable()
export class WorkerService {
  private workers = new Map<string, Worker>();

  constructor(private readonly jobHandler: JobHandlerService) {}

  createWorkerForUser(userId: string): Worker {
    const queueName = `queue-user-${userId}`;
    if (this.workers.has(userId)) {
      return <Worker<any, any, string>>this.workers.get(userId);
    }

    const worker = new Worker(
      queueName,
      async (job: Job) => {
        console.log(`Verarbeite Job ${job.id} in ${queueName}:`, job.data);
        await this.jobHandler.handleJob(job);
      },
      {
        connection: {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: +(process.env.REDIS_PORT ?? 6379),
        },
      },
    );

    worker.on('completed', (job: Job) => {
      console.log(`Job ${job.id} in ${queueName} completed.`);
    });


    this.workers.set(userId, worker);
    return worker;
  }
}
