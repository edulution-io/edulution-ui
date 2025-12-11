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
import FileOperationQueueJobData from '@libs/queue/constants/fileOperationQueueJobData';
import DeleteFileJobData from '@libs/queue/types/deleteFileJobData';
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import buildNormalizedWebdavPath from '@libs/filesharing/utils/buildNormalizedWebdavPath';
import toSanitizedPathRegex from '@libs/filesharing/utils/toSanitizedPathRegex';
import WebdavService from '../../webdav/webdav.service';
import SseService from '../../sse/sse.service';
import { PublicShare } from '../publicFileShare.schema';

@Injectable()
class DeleteFileConsumer extends WorkerHost {
  constructor(
    private readonly webDavService: WebdavService,
    private readonly sseService: SseService,
    @InjectModel(PublicShare.name)
    private readonly shareModel: Model<PublicShare>,
  ) {
    super();
  }

  async process(job: Job<FileOperationQueueJobData>): Promise<void> {
    const { username, originFilePath, processed, total, webdavFilePath, share } = job.data as DeleteFileJobData;
    const targetPath = buildNormalizedWebdavPath(webdavFilePath);
    const sanitizedPathRegex = toSanitizedPathRegex(targetPath, 'g');

    const failedPaths: string[] = [];
    try {
      await this.webDavService.deletePath(username, originFilePath, share);
      await this.shareModel.deleteMany({ filePath: sanitizedPathRegex });
    } catch (error) {
      failedPaths.push(originFilePath);
    }

    const percent = Math.round((processed / total) * 100);

    const progressDto: FilesharingProgressDto = {
      processID: Number(job.id),
      title: 'filesharing.progressBox.titleDeleting',
      description: 'filesharing.progressBox.fileInfoDeleting',
      statusDescription: 'filesharing.progressBox.processedDeletingInfo',
      processed,
      total,
      percent,
      currentFilePath: originFilePath,
      username: '',
      failedPaths,
    };
    this.sseService.sendEventToUser(username, progressDto, SSE_MESSAGE_TYPE.FILESHARING_DELETE_FILES);
  }
}

export default DeleteFileConsumer;
