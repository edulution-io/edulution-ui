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
import UploadFileJobData from '@libs/queue/types/uploadFileJobData';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import FileOperationQueueJobData from '@libs/queue/constants/fileOperationQueueJobData';
import { createReadStream } from 'fs';
import { unlink } from 'fs-extra';
import WebdavService from '../../webdav/webdav.service';
import SseService from '../../sse/sse.service';

@Injectable()
class UploadFileConsumer extends WorkerHost {
  constructor(
    private readonly webDavService: WebdavService,
    private readonly sseService: SseService,
  ) {
    super();
  }

  async process(job: Job<FileOperationQueueJobData>): Promise<void> {
    const { username, fullPath, tempPath, mimeType, processed, total } = job.data as UploadFileJobData;
    const fileStream = createReadStream(tempPath);
    await this.webDavService.uploadFile(username, fullPath, fileStream, mimeType);
    await unlink(tempPath);
    const percent = Math.round((processed / total) * 100);
    this.sseService.sendEventToUser(
      username,
      {
        processID: Number(job.id),
        title: 'filesharing.progressBox.zipFilesAreUploading',
        processed,
        total,
        percent,
      },
      SSE_MESSAGE_TYPE.FILESHARING_FILE_UPLOAD,
    );
  }
}

export default UploadFileConsumer;
