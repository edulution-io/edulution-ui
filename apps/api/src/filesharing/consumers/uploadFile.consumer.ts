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
import FileOperationQueueJobData from '@libs/queue/constants/fileOperationQueueJobData';
import CustomFile from '@libs/filesharing/types/customFile';
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
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
    let buffer: Buffer;
    if (file.buffer) {
      buffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
    } else if (base64) {
      buffer = Buffer.from(base64, 'base64');
    } else {
      return;
    }
    const percent = Math.round((processed / total) * 100);

    const uploadFile: CustomFile = {
      ...file,
      buffer,
      mimetype: mimeType,
      size,
    } as CustomFile;

    await this.webDavService.uploadFile(username, fullPath, uploadFile);

    const progressDto: FilesharingProgressDto = {
      processID: Number(job.id),
      title: 'filesharing.progressBox.zipFilesAreUploading',
      processed,
      total,
      percent,
    };

    this.sseService.sendEventToUser(username, progressDto, SSE_MESSAGE_TYPE.FILESHARING_FILE_UPLOAD);
  }
}

export default UploadFileConsumer;
