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
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import FileOperationQueueJobData from '@libs/queue/constants/fileOperationQueueJobData';
import DeleteFileJobData from '@libs/queue/types/deleteFileJobData';
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import normalizeWebdavPath from '@libs/filesharing/utils/buildNormalizedWebdavPath';
import sanitizeRegexPattern from '@libs/filesharing/utils/sanitizeRegexPattern';
import WebdavService from '../../webdav/webdav.service';
import SseService from '../../sse/sse.service';
import { PublicFileShare } from '../publicFileShare.schema';

@Injectable()
class DeleteFileConsumer extends WorkerHost {
  constructor(
    private readonly webDavService: WebdavService,
    private readonly sseService: SseService,
    @InjectModel(PublicFileShare.name)
    private readonly shareModel: Model<PublicFileShare>,
  ) {
    super();
  }

  async process(job: Job<FileOperationQueueJobData>): Promise<void> {
    const { username, originFilePath, processed, total, webdavFilePath } = job.data as DeleteFileJobData;
    const targetPath = normalizeWebdavPath(webdavFilePath);
    const escaped = sanitizeRegexPattern(targetPath);
    const pathRegex = new RegExp(`^${escaped}(\\/|$)`);

    const failedPaths: string[] = [];
    try {
      await this.webDavService.deletePath(username, originFilePath);
      await this.shareModel.deleteMany({ filePath: pathRegex });
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
