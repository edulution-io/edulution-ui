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
import { Injectable } from '@nestjs/common';
import FileOperationQueueJobData from '@libs/queue/constants/fileOperationQueueJobData';
import { Job } from 'bullmq';
import MoveOrRenameJobData from '@libs/queue/types/moveOrRenameJobData';
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import buildNormalizedWebdavPath from '@libs/filesharing/utils/buildNormalizedWebdavPath';
import toSanitizedPathRegex from '@libs/filesharing/utils/toSanitizedPathRegex';
import SseService from '../../sse/sse.service';
import WebdavService from '../../webdav/webdav.service';
import { PublicShare } from '../publicFileShare.schema';

@Injectable()
class MoveOrRenameConsumer extends WorkerHost {
  constructor(
    private readonly webDavService: WebdavService,
    private readonly sseService: SseService,
    @InjectModel(PublicShare.name)
    private readonly shareModel: Model<PublicShare>,
  ) {
    super();
  }

  async process(job: Job<FileOperationQueueJobData>): Promise<void> {
    const { username, path, newPath, processed, total, share } = job.data as MoveOrRenameJobData;
    const failedPaths: string[] = [];

    const oldNormalizedPath = buildNormalizedWebdavPath(path);
    const newNormalizedPath = buildNormalizedWebdavPath(newPath);

    try {
      await this.webDavService.moveOrRenameResource(username, path, newPath, share);
      const sanitizedPathRegex = toSanitizedPathRegex(oldNormalizedPath, 'g');

      await this.shareModel.updateMany(
        { filePath: sanitizedPathRegex },
        [
          {
            $set: {
              filePath: {
                $replaceOne: {
                  input: '$filePath',
                  find: oldNormalizedPath,
                  replacement: newNormalizedPath,
                },
              },
            },
          },
        ],
        { strict: false },
      );
    } catch (err) {
      failedPaths.push(newPath);
    }

    const percent = Math.round((processed / total) * 100);

    const progressDto: FilesharingProgressDto = {
      processID: Number(job.id),
      title: 'filesharing.progressBox.titleMoving',
      description: 'filesharing.progressBox.fileInfoMoving',
      statusDescription: 'filesharing.progressBox.processedMovingInfo',
      processed,
      total,
      percent,
      currentFilePath: path,
      username: '',
      failedPaths,
    };
    this.sseService.sendEventToUser(username, progressDto, SSE_MESSAGE_TYPE.FILESHARING_MOVE_OR_RENAME_FILES);
  }
}

export default MoveOrRenameConsumer;
