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
import CustomFile from '@libs/filesharing/types/customFile';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import { createReadStream } from 'fs-extra';
import FileOperationQueueJobData from '@libs/queue/constants/fileOperationQueueJobData';
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
    const { username, fullPath, file, mimeType, size, base64, processed, total } = job.data as UploadFileJobData;

    let uploadFile: CustomFile;

    if (file.path) {
      uploadFile = {
        ...file,
        mimetype: mimeType,
        size,
        stream: createReadStream(file.path),
      } as CustomFile;
    } else if (file.buffer) {
      const buffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
      uploadFile = {
        ...file,
        buffer,
        mimetype: mimeType,
        size,
      } as CustomFile;
    } else if (base64) {
      const buffer = Buffer.from(base64, 'base64');
      uploadFile = {
        ...file,
        buffer,
        mimetype: mimeType,
        size,
      } as CustomFile;
    } else {
      return;
    }
    await this.webDavService.uploadFile(username, fullPath, uploadFile);
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
