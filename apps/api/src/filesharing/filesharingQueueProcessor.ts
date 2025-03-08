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
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import type UserConnections from '../types/userConnections';
import SseService from '../sse/sse.service';
import FilesharingService from './filesharing.service';

@Processor('genericQueue')
class FilesharingQueueProcessor {
  constructor(private readonly fileSharingService: FilesharingService) {}

  private fileSharingSseConnections: UserConnections = new Map();

  subscribe(username: string, res: Response): Observable<MessageEvent> {
    return SseService.subscribe(username, this.fileSharingSseConnections, res);
  }

  @Process({ name: 'duplicate-file', concurrency: 1 })
  public async handleDuplicateFile(
    job: Job<{
      username: string;
      originFilePath: string;
      destinationPath: string;
      studentName: string;
      duplicateFileOperationsCount: number;
      processed: number;
    }>,
  ) {
    const { username, originFilePath, destinationPath, duplicateFileOperationsCount, processed, studentName } =
      job.data;

    let failed = 0;

    const client = await this.fileSharingService.getClient(username);
    const pathUpToTransferFolder = FilesharingService.getPathUntilFolder(destinationPath, FILE_PATHS.TRANSFER);
    const pathUpToTeacherFolder = FilesharingService.getPathUntilFolder(destinationPath, username);

    const userFolderExists = await this.fileSharingService.checkIfFileOrFolderExists(
      username,
      pathUpToTransferFolder,
      username,
      ContentType.DIRECTORY,
    );

    if (!userFolderExists) {
      await this.fileSharingService.createFolder(username, pathUpToTransferFolder, username);
    }

    if (!userFolderExists) {
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
    try {
      await FilesharingService.copyFileViaWebDAV(client, originFilePath, destinationPath);
    } catch (e) {
      failed += 1;
    }

    const percent = Math.round(((processed + failed) / duplicateFileOperationsCount) * 100);

    SseService.sendEventToUser(
      username,
      this.fileSharingSseConnections,
      new FilesharingProgressDto(
        Number(job.id),
        processed,
        failed,
        duplicateFileOperationsCount,
        studentName,
        percent,
        originFilePath,
      ),
      SSE_MESSAGE_TYPE.UPDATED,
    );
  }
}

export default FilesharingQueueProcessor;
