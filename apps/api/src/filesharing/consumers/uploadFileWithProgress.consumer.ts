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

import { Injectable } from '@nestjs/common';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { createReadStream, statSync } from 'fs';
import { unlink } from 'fs-extra';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import UploadFileWithProgressJobData from '@libs/queue/types/uploadFileWithProgressJobData';
import FileOperationQueueJobData from '@libs/queue/constants/fileOperationQueueJobData';
import SseService from '../../sse/sse.service';
import WebdavService from '../../webdav/webdav.service';

@Injectable()
class UploadFileWithProgressConsumer extends WorkerHost {
  constructor(
    private readonly webdavService: WebdavService,
    private readonly sseService: SseService,
  ) {
    super();
  }

  async process(job: Job<FileOperationQueueJobData>): Promise<void> {
    const { username, fullPath, tempPath, mimeType, expectedBytes, title, description, currentFilePath } =
      job.data as UploadFileWithProgressJobData;

    const readStream = createReadStream(tempPath);
    const fileSizeOnDisk = (() => {
      try {
        return statSync(tempPath).size;
      } catch {
        return undefined;
      }
    })();
    const totalBytes = (expectedBytes && expectedBytes > 0 ? expectedBytes : fileSizeOnDisk) ?? 0;

    let lastPercent = -1;

    const emitProgress = (transferredBytes: number, totalFromTransport?: number, isFinal = false) => {
      const referenceTotal = totalFromTransport && totalFromTransport > 0 ? totalFromTransport : totalBytes;
      let percent = referenceTotal > 0 ? Math.floor((transferredBytes / referenceTotal) * 100) : 0;
      if (!isFinal && percent >= 100) percent = 99;
      if (!isFinal && percent <= lastPercent) return;
      lastPercent = percent;

      const dto: FilesharingProgressDto = {
        processID: Number(job.id),
        title,
        description,
        processed: transferredBytes,
        total: referenceTotal || undefined,
        percent: referenceTotal > 0 ? percent : undefined,
        currentFilePath,
      };
      this.sseService.sendEventToUser(username, dto, SSE_MESSAGE_TYPE.FILESHARING_FILE_UPLOAD_PROGRESS);
    };

    const finalizeProgress = (state: 'ok' | 'failed' | 'aborted', info?: { message?: string }) => {
      if (state === 'ok') {
        const dto: FilesharingProgressDto = {
          processID: Number(job.id),
          title,
          description,
          processed: totalBytes || undefined,
          total: expectedBytes || undefined,
          percent: totalBytes ? 100 : undefined,
          currentFilePath,
        };
        this.sseService.sendEventToUser(username, dto, SSE_MESSAGE_TYPE.FILESHARING_FILE_UPLOAD_PROGRESS);
        return;
      }
      const dto: FilesharingProgressDto = {
        processID: Number(job.id),
        title: 'filesharing.progressBox.uploadFailed',
        description: info?.message ?? description,
        processed: undefined,
        total: totalBytes || undefined,
        percent: undefined,
        currentFilePath,
      };
      this.sseService.sendEventToUser(username, dto, SSE_MESSAGE_TYPE.FILESHARING_FILE_UPLOAD_PROGRESS);
    };

    emitProgress(0, totalBytes);

    try {
      await this.webdavService.uploadFileWithNetworkProgress(
        username,
        fullPath,
        readStream,
        mimeType,
        (transferred, reportedTotal) => emitProgress(transferred, reportedTotal),
        totalBytes,
      );
      finalizeProgress('ok');
    } catch (error) {
      finalizeProgress('failed', { message: (error as Error).message });
      throw error;
    } finally {
      await unlink(tempPath).catch(() => undefined);
    }
  }
}

export default UploadFileWithProgressConsumer;
