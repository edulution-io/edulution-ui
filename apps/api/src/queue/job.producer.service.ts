
import { Injectable } from '@nestjs/common';
import {DynamicQueueService} from "./queue.service";

@Injectable()
export class JobProducerService {
  constructor(private readonly dynamicQueueService: DynamicQueueService) {}

  async addJob(userId: string, jobName: string, data: any): Promise<void> {
    await this.dynamicQueueService.addJobForUser(userId, jobName, data);
  }
}
