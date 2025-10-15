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
import { Injectable } from '@nestjs/common';

import FileJobData from '@libs/queue/types/fileJobData';

import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import FileOperationQueueJobData from '@libs/queue/constants/fileOperationQueueJobData';
import FILE_PATHS from '@libs/filesharing/constants/file-paths';
import getUsernameFromPath from '@libs/filesharing/utils/getUsernameFromPath';
import SseService from '../../sse/sse.service';
import WebdavService from '../../webdav/webdav.service';

@Injectable()
class DuplicateFileConsumer extends WorkerHost {
  constructor(
    private readonly webDavService: WebdavService,
    private readonly sseService: SseService,
  ) {
    super();
  }

  async process(job: Job<FileOperationQueueJobData>): Promise<void> {
    const { username, originFilePath, destinationFilePath, total, processed, share } = job.data as FileJobData;
    const failedPaths: string[] = [];

    const pathUpToTransferFolder = this.webDavService.getPathUntilFolder(destinationFilePath, FILE_PATHS.TRANSFER);
    const pathUpToTeacherFolder = this.webDavService.getPathUntilFolder(destinationFilePath, username);

    await this.webDavService.ensureFolderExists(username, pathUpToTransferFolder, username, share);
    await this.webDavService.ensureFolderExists(username, pathUpToTeacherFolder, FILE_PATHS.COLLECT, share);

    try {
      await this.webDavService.copyFileViaWebDAV(username, originFilePath, destinationFilePath, share);
    } catch {
      failedPaths.push(destinationFilePath);
    }

    const percent = Math.round((processed / total) * 100);
    const destinationUsername = getUsernameFromPath(destinationFilePath) || '';

    const progressDto: FilesharingProgressDto = {
      processID: Number(job.id),
      title: 'filesharing.progressBox.titleSharing',
      description: 'filesharing.progressBox.fileInfoSharing',
      statusDescription: 'filesharing.progressBox.processedSharingInfo',
      processed,
      total,
      percent,
      currentFilePath: originFilePath,
      username: destinationUsername,
      failedPaths,
    };

    this.sseService.sendEventToUser(username, progressDto, SSE_MESSAGE_TYPE.FILESHARING_SHARE_FILES);
  }
}

export default DuplicateFileConsumer;
