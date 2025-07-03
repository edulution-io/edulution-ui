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
    const { username, path, newPath, processed, total } = job.data as MoveOrRenameJobData;
    const failedPaths: string[] = [];

    const oldNormalizedPath = buildNormalizedWebdavPath(path);
    const newNormalizedPath = buildNormalizedWebdavPath(newPath);

    try {
      await this.webDavService.moveOrRenameResource(username, path, newPath);
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
