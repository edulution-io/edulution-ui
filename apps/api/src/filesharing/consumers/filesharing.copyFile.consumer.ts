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

import FILESHARING_QUEUE_NAMES from '@libs/filesharing/constants/queueName';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FilesharingProgressDto } from '@libs/filesharing/types/filesharingProgressDto';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import DuplicateFileJobData from '@libs/queue/types/duplicateFileJobData';
import FilesharingService from '../filesharing.service';
import SseService from '../../sse/sse.service';
import type UserConnections from '../../types/userConnections';

@Processor(FILESHARING_QUEUE_NAMES.COPY_QUEUE)
class FilesharingCopyFileConsumer extends WorkerHost {
  private fileSharingSseConnections: UserConnections = new Map();

  constructor(private readonly fileSharingService: FilesharingService) {
    super();
  }

  async process(job: Job<DuplicateFileJobData>): Promise<void> {
    const { username, originFilePath, destinationFilePath, total, processed } = job.data;

    const decodedOriginFilePath = decodeURIComponent(originFilePath);
    const decodedDestinationFilePath = decodeURIComponent(destinationFilePath);

    const failedPaths: string[] = [];

    const client = await this.fileSharingService.getClient(username);

    try {
      await FilesharingService.copyFileViaWebDAV(client, decodedOriginFilePath, decodedDestinationFilePath);
    } catch {
      failedPaths.push(decodedDestinationFilePath);
    }

    const percent = Math.round((processed / total) * 100);
    const studentName = FilesharingService.getStudentNameFromPath(decodedDestinationFilePath) || '';

    const progressDto: FilesharingProgressDto = {
      processID: Number(job.id),
      processed,
      total,
      percent,
      currentFile: originFilePath,
      studentName,
      failedPaths,
    };

    SseService.sendEventToUser(username, this.fileSharingSseConnections, progressDto, SSE_MESSAGE_TYPE.UPDATED);
  }
}

export default FilesharingCopyFileConsumer;
