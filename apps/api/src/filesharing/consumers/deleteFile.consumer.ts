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

import { WorkerHost } from '@nestjs/bullmq';
import { Observable } from 'rxjs';
import { Job } from 'bullmq';
import { MessageEvent } from '@nestjs/common';
import { Response } from 'express';
import JobData from '@libs/queue/constants/jobData';
import DeleteFileJobData from '@libs/queue/types/deleteFileJobData';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import WebDavService from '../../webdav/webDavService';
import SseService from '../../sse/sse.service';
import type UserConnections from '../../types/userConnections';
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import FilePaths from '@libs/filesharing/constants/file-paths';

class DeleteFileConsumer extends WorkerHost {
  private fileDeletingSseConnections: UserConnections = new Map();

  subscribe(username: string, res: Response): Observable<MessageEvent> {
    return SseService.subscribe(username, this.fileDeletingSseConnections, res);
  }

  async process(job: Job<JobData>): Promise<void> {
    const { username, originFilePath, total, processed } = job.data as DeleteFileJobData;

    const failedPaths: string[] = [];
    try {
      await WebDavService.deletePath(username, originFilePath);
    } catch (error) {
      failedPaths.push(originFilePath);
    }

    if (total > 2) {
      const percent = Math.round((processed / total) * 100);

      const progressDto: FilesharingProgressDto = {
        processID: Number(job.id),
        title: 'filesharing.progressBox.titleCollecting',
        description: 'filesharing.progressBox.fileInfoCollecting',
        statusDescription: 'filesharing.progressBox.processedCollectingInfo',
        processed,
        total,
        studentName: username,
        percent,
        currentFilePath: FilePaths.COLLECT,
        failedPaths,
      };

      SseService.sendEventToUser(username, this.fileDeletingSseConnections, progressDto, SSE_MESSAGE_TYPE.UPDATED);
    }
  }
}

export default DeleteFileConsumer;
