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
import FILE_PATHS from '@libs/filesharing/constants/file-paths';
import LMN_API_COLLECT_OPERATIONS from '@libs/lmnApi/constants/lmnApiCollectOperations';
import CollectFileJobData from '@libs/queue/types/collectFileJobData';
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import WebdavService from '../../webdav/webdav.service';
import SseService from '../../sse/sse.service';

@Injectable()
class CollectFileConsumer extends WorkerHost {
  constructor(
    private readonly webDavService: WebdavService,
    private readonly sseService: SseService,
  ) {
    super();
  }

  async process(job: Job<FileOperationQueueJobData>): Promise<void> {
    const { username, item, operationType, processed, total, share } = job.data as CollectFileJobData;
    const failedPaths: string[] = [];

    try {
      await this.webDavService.createFolder(username, item.destinationPath, item.userName, share);

      if (operationType === LMN_API_COLLECT_OPERATIONS.CUT) {
        await this.webDavService.cutCollectedItems(username, item.originPath, item.destinationPath, share);
      } else {
        await this.webDavService.copyCollectedItems(
          username,
          {
            originFilePath: item.originPath,
            destinationFilePaths: [`${item.destinationPath}`],
          },
          share,
        );
      }
    } catch (error) {
      failedPaths.push(item.destinationPath);
    }

    const percent = Math.round((processed / total) * 100);

    const progressDto: FilesharingProgressDto = {
      processID: Number(job.id),
      title: 'filesharing.progressBox.titleCollecting',
      description: 'filesharing.progressBox.fileInfoCollecting',
      statusDescription: 'filesharing.progressBox.processedCollectingInfo',
      processed,
      total,
      username,
      percent,
      currentFilePath: FILE_PATHS.COLLECT,
      failedPaths,
    };

    this.sseService.sendEventToUser(username, progressDto, SSE_MESSAGE_TYPE.FILESHARING_COLLECT_FILES);
  }
}

export default CollectFileConsumer;
