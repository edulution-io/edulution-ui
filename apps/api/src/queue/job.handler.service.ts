import {Injectable} from '@nestjs/common';
import { Job } from 'bullmq';
import JOB_NAMES from '@libs/queue/constants/jobNames';
import delay from "@libs/common/utils/delay";
import * as console from "node:console";
import DuplicateFileConsumer from "../filesharing/consumers/duplicateFile.consumer";

@Injectable()
export class JobHandlerService {


  constructor( private readonly duplicateFileConsumer: DuplicateFileConsumer) {}


  async handleJob(job: Job): Promise<void> {
    switch (job.name) {
      case JOB_NAMES.COLLECT_FILE_JOB:
        await this.handleCollectFileJob(job);
        break;
      case JOB_NAMES.DUPLICATE_FILE_JOB:
        await this.handleDuplicateFileJob(job);
        break;
      default:
    }
  }

  private async handleCollectFileJob(job: Job): Promise<void> {
    console.log('Handling COLLECT_FILE_JOB', job);
    await delay(5000);
  }

  private async handleDuplicateFileJob(job: Job): Promise<void> {
    await this.duplicateFileConsumer.process(job);
  }
}
