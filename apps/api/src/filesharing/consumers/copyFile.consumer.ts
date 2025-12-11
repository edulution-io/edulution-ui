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
