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
import normalizeWebdavPath from '@libs/filesharing/utils/buildNormalizedWebdavPath';
import SseService from '../../sse/sse.service';
import WebdavService from '../../webdav/webdav.service';
import { PublicFileShare } from '../publicFileShare.schema';

@Injectable()
class MoveOrRenameConsumer extends WorkerHost {
  constructor(
    private readonly webDavService: WebdavService,
    private readonly sseService: SseService,
    @InjectModel(PublicFileShare.name)
    private readonly shareModel: Model<PublicFileShare>,
  ) {
    super();
  }

  async process(job: Job<FileOperationQueueJobData>): Promise<void> {
    const { username, path, newPath, total, processed } = job.data as MoveOrRenameJobData;
    const failedPaths: string[] = [];
    const share = await this.shareModel.findOne({ filePath: normalizeWebdavPath(path) });
    try {
      await this.webDavService.moveOrRenameResource(username, path, newPath);
      if (share) {
        const { _id: id } = share;
        await this.shareModel.findByIdAndUpdate(id, { filePath: normalizeWebdavPath(newPath) });
      }
    } catch (error) {
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
