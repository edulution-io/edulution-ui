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

import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import FILE_PATHS from '@libs/filesharing/constants/file-paths';
import ContentType from '@libs/filesharing/types/contentType';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { FilesharingProgressDto } from '@libs/filesharing/types/filesharingProgressDto';
import type UserConnections from '../types/userConnections';
import SseService from '../sse/sse.service';
import FilesharingService from './filesharing.service';
import { QUEUE_NAMES } from '../common/queueNames/queueNames';

@Processor(QUEUE_NAMES.GENERIC_QUEUE)
class FilesharingQueueProcessor {
  constructor(private readonly fileSharingService: FilesharingService) {}

  private fileSharingSseConnections: UserConnections = new Map();

  subscribe(username: string, res: Response): Observable<MessageEvent> {
    return SseService.subscribe(username, this.fileSharingSseConnections, res);
  }

  @Process({ name: QUEUE_NAMES.DUPLICATE_FILE_QUEUE, concurrency: 1 })
  public async handleDuplicateFile(
    job: Job<{
      username: string;
      originFilePath: string;
      destinationFilePaths: string[];
    }>,
  ) {
    const { username, originFilePath, destinationFilePaths } = job.data;

    const total = destinationFilePaths.length;
    let processed = 0;
    const failedPaths: string[] = [];

    const client = await this.fileSharingService.getClient(username);

    if (destinationFilePaths.length > 0) {
      const firstPath = destinationFilePaths[0];

      const pathUpToTransferFolder = FilesharingService.getPathUntilFolder(firstPath, FILE_PATHS.TRANSFER);
      const pathUpToTeacherFolder = FilesharingService.getPathUntilFolder(firstPath, username);

      const userFolderExists = await this.fileSharingService.checkIfFileOrFolderExists(
        username,
        pathUpToTransferFolder,
        username,
        ContentType.DIRECTORY,
      );
      if (!userFolderExists) {
        await this.fileSharingService.createFolder(username, pathUpToTransferFolder, username);
      }

      if (userFolderExists) {
        const collectFolderExists = await this.fileSharingService.checkIfFileOrFolderExists(
          username,
          pathUpToTeacherFolder,
          FILE_PATHS.COLLECT,
          ContentType.DIRECTORY,
        );

        if (!collectFolderExists) {
          await this.fileSharingService.createFolder(username, pathUpToTeacherFolder, FILE_PATHS.COLLECT);
        }
      }
    }

    /* eslint-disable no-restricted-syntax, no-await-in-loop */
    for (const destinationPath of destinationFilePaths) {
      try {
        // no-await-in-loop
        await FilesharingService.copyFileViaWebDAV(client, originFilePath, destinationPath);
      } catch (e) {
        failedPaths.push(destinationPath);
      }

      processed += 1;
      const percent = Math.round((processed / total) * 100);
      const studentName = FilesharingService.getStudentNameFromPath(destinationPath) || '';

      SseService.sendEventToUser(
        username,
        this.fileSharingSseConnections,
        new FilesharingProgressDto(Number(job.id), processed, total, studentName, percent, originFilePath, failedPaths),
        SSE_MESSAGE_TYPE.UPDATED,
      );
    }
  }
}

export default FilesharingQueueProcessor;
