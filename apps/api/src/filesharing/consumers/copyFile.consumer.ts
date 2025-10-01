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
import { join, parse } from 'path';

import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import FileOperationQueueJobData from '@libs/queue/constants/fileOperationQueueJobData';
import getUsernameFromPath from '@libs/filesharing/utils/getUsernameFromPath';
import getNextAvailableFilename from '@libs/filesharing/utils/getNextAvailableFilename';
import FileJobData from '@libs/queue/types/fileJobData';
import SseService from '../../sse/sse.service';
import WebdavService from '../../webdav/webdav.service';

@Injectable()
class CopyFileConsumer extends WorkerHost {
  constructor(
    private readonly webDavService: WebdavService,
    private readonly sseService: SseService,
  ) {
    super();
  }

  async process(job: Job<FileOperationQueueJobData>): Promise<void> {
    const { username, originFilePath, destinationFilePath, total, processed, share } = job.data as FileJobData;
    const failedPaths: string[] = [];

    const parsed = parse(destinationFilePath);
    const targetFolderPath = parsed.dir;
    const originalName = parsed.name;
    const extension = parsed.ext;

    const items = await this.webDavService.getFilesAtPath(username, targetFolderPath, share);

    const uniqueFilename = getNextAvailableFilename(originalName, extension, items);

    try {
      await this.webDavService.copyFileViaWebDAV(
        username,
        originFilePath,
        join(targetFolderPath, '/', uniqueFilename),
        share,
      );
    } catch {
      failedPaths.push(destinationFilePath);
    }

    const percent = Math.round((processed / total) * 100);

    const progressDto: FilesharingProgressDto = {
      processID: Number(job.id),
      title: 'filesharing.progressBox.titleCopying',
      description: 'filesharing.progressBox.fileInfoCopying',
      statusDescription: 'filesharing.progressBox.processedCopyingInfo',
      processed,
      total,
      percent,
      currentFilePath: originFilePath,
      username: getUsernameFromPath(destinationFilePath) || '',
      failedPaths,
    };

    this.sseService.sendEventToUser(username, progressDto, SSE_MESSAGE_TYPE.FILESHARING_COPY_FILES);
  }
}

export default CopyFileConsumer;
