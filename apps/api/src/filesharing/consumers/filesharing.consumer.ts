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

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';

import APPS from '@libs/appconfig/constants/apps';
import FILE_PATHS from '@libs/filesharing/constants/file-paths';
import { FilesharingProgressDto } from '@libs/filesharing/types/filesharingProgressDto';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';

import JOB_NAMES from '@libs/queue/constants/jobNames';
import DuplicateFileJobData from '@libs/queue/types/duplicateFileJobData';
import type UserConnections from '../../types/userConnections';
import FilesharingService from '../filesharing.service';
import SseService from '../../sse/sse.service';

@Processor(`${APPS.FILE_SHARING}-${JOB_NAMES.DUPLICATE_FILE_JOB}`, { concurrency: 1 })
class FilesharingConsumer extends WorkerHost {
  private fileSharingSseConnections: UserConnections = new Map();

  constructor(private readonly fileSharingService: FilesharingService) {
    super();
  }

  subscribe(username: string, res: Response): Observable<MessageEvent> {
    return SseService.subscribe(username, this.fileSharingSseConnections, res);
  }

  async process(job: Job<DuplicateFileJobData>): Promise<void> {
    await this.processDuplicateFile(job);
  }

  private async processDuplicateFile(job: Job<DuplicateFileJobData>): Promise<void> {
    const { username, originFilePath, destinationFilePath, total, processed } = job.data;
    const failedPaths: string[] = [];

    const client = await this.fileSharingService.getClient(username);

    const pathUpToTransferFolder = FilesharingService.getPathUntilFolder(destinationFilePath, FILE_PATHS.TRANSFER);
    const pathUpToTeacherFolder = FilesharingService.getPathUntilFolder(destinationFilePath, username);

    await this.fileSharingService.ensureFolderExists(username, pathUpToTransferFolder, username);
    await this.fileSharingService.ensureFolderExists(username, pathUpToTeacherFolder, FILE_PATHS.COLLECT);

    try {
      await FilesharingService.copyFileViaWebDAV(client, originFilePath, destinationFilePath);
    } catch {
      failedPaths.push(destinationFilePath);
    }

    const percent = Math.round((processed / total) * 100);
    const studentName = FilesharingService.getStudentNameFromPath(destinationFilePath) || '';

    const progressDto: FilesharingProgressDto = {
      processID: Number(job.id),
      title: 'filesharing.progressBox.titleSharing',
      description: 'filesharing.progressBox.fileInfoSharing',
      statusDescription: 'filesharing.progressBox.processedSharingInfo',
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

export default FilesharingConsumer;
