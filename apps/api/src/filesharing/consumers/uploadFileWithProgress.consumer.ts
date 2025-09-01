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
    private readonly webDavService: WebdavService,
    private readonly sse: SseService,
  ) {
    super();
  }

  async process(job: Job<FileOperationQueueJobData>): Promise<void> {
    const { username, fullPath, tempPath, mimeType, expectedBytes, title, description, currentFilePath } =
      job.data as UploadFileWithProgressJobData;

    const source = createReadStream(tempPath);
    const statSize = (() => {
      try {
        return statSync(tempPath).size;
      } catch {
        return undefined;
      }
    })();
    const totalSize = (expectedBytes && expectedBytes > 0 ? expectedBytes : statSize) ?? 0;

    let lastPct = -1;

    const send = (transferred: number, total?: number, final = false) => {
      const totalRef = total && total > 0 ? total : totalSize;
      let pct = totalRef > 0 ? Math.floor((transferred / totalRef) * 100) : 0;
      if (!final && pct >= 100) pct = 99;
      if (!final && pct <= lastPct) return;
      lastPct = pct;

      const dto: FilesharingProgressDto = {
        processID: Number(job.id),
        title,
        description,
        processed: transferred,
        total: totalRef || undefined,
        percent: totalRef > 0 ? pct : undefined,
        currentFilePath,
      };
      this.sse.sendEventToUser(username, dto, SSE_MESSAGE_TYPE.FILESHARING_FILE_UPLOAD_PROGRESS);
    };

    const finish = (state: 'ok' | 'failed' | 'aborted', info?: { message?: string }) => {
      if (state === 'ok') {
        const dto: FilesharingProgressDto = {
          processID: Number(job.id),
          title,
          description,
          processed: totalSize || undefined,
          total: totalSize || undefined,
          percent: totalSize ? 100 : undefined,
          currentFilePath,
        };
        this.sse.sendEventToUser(username, dto, SSE_MESSAGE_TYPE.FILESHARING_FILE_UPLOAD_PROGRESS);
        return;
      }
      const dto: FilesharingProgressDto = {
        processID: Number(job.id),
        title: 'filesharing.progressBox.uploadFailed',
        description: info?.message ?? description,
        processed: undefined,
        total: totalSize || undefined,
        percent: undefined,
        currentFilePath,
      };
      this.sse.sendEventToUser(username, dto, SSE_MESSAGE_TYPE.FILESHARING_FILE_UPLOAD_PROGRESS);
    };

    send(0, totalSize);

    try {
      await this.webDavService.uploadFileWithNetworkProgress(
        username,
        fullPath,
        source,
        mimeType,
        (tx, tot) => send(tx, tot),
        totalSize,
      );
      finish('ok');
    } catch (e) {
      finish('failed', { message: (e as Error).message });
      throw e;
    } finally {
      await unlink(tempPath).catch(() => undefined);
    }
  }
}

export default UploadFileWithProgressConsumer;
