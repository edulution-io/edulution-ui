/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
    const { username, fullPath, tempPath, mimeType, processed, total, share } = job.data as UploadFileJobData;
    const fileStream = createReadStream(tempPath);
    await this.webDavService.uploadFile(username, fullPath, fileStream, mimeType, share);
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
