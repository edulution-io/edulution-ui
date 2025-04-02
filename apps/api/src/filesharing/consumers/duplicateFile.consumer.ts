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
import { Job } from 'bullmq';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { Injectable, MessageEvent } from '@nestjs/common';

import DuplicateFileJobData from '@libs/queue/types/duplicateFileJobData';

import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import JobData from '@libs/queue/constants/jobData';
import FILE_PATHS from '@libs/filesharing/constants/file-paths';
import type UserConnections from '../../types/userConnections';
import SseService from '../../sse/sse.service';
import WebDavService from '../../webdav/webDavService';

@Injectable()
class DuplicateFileConsumer extends WorkerHost {
  private fileSharingSseConnections: UserConnections = new Map();

  constructor(private readonly webDavService: WebDavService) {
    super();
  }

  subscribe(username: string, res: Response): Observable<MessageEvent> {
    return SseService.subscribe(username, this.fileSharingSseConnections, res);
  }

  process = async (job: Job<JobData>): Promise<void> => {
    const { username, originFilePath, destinationFilePath, total, processed } = job.data as DuplicateFileJobData;
    const failedPaths: string[] = [];

    const pathUpToTransferFolder = this.webDavService.getPathUntilFolder(destinationFilePath, FILE_PATHS.TRANSFER);
    const pathUpToTeacherFolder = this.webDavService.getPathUntilFolder(destinationFilePath, username);

    await this.webDavService.ensureFolderExists(username, pathUpToTransferFolder, username);
    await this.webDavService.ensureFolderExists(username, pathUpToTeacherFolder, FILE_PATHS.COLLECT);

    try {
      await this.webDavService.copyFileViaWebDAV(username, originFilePath, destinationFilePath);
    } catch {
      failedPaths.push(destinationFilePath);
    }

    const percent = Math.round((processed / total) * 100);
    const studentName = this.webDavService.getStudentNameFromPath(destinationFilePath) || '';

    const progressDto: FilesharingProgressDto = {
      processID: Number(job.id),
      title: 'filesharing.progressBox.titleSharing',
      description: 'filesharing.progressBox.fileInfoSharing',
      statusDescription: 'filesharing.progressBox.processedSharingInfo',
      processed,
      total,
      percent,
      currentFilePath: originFilePath,
      studentName,
      failedPaths,
    };

    SseService.sendEventToUser(username, this.fileSharingSseConnections, progressDto, SSE_MESSAGE_TYPE.UPDATED);
  };
}

export default DuplicateFileConsumer;
