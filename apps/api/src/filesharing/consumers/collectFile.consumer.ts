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
import { Response } from 'express';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import CollectFileJobData from '@libs/queue/types/collectFileJobData';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import JobData from '@libs/queue/constants/jobData';
import FILE_PATHS from '@libs/filesharing/constants/file-paths';
import LMN_API_COLLECT_OPERATIONS from '@libs/lmnApi/constants/lmnApiCollectOperations';
import SseService from '../../sse/sse.service';
import type UserConnections from '../../types/userConnections';
import WebDavService from '../../webdav/webDavService';

class CollectFileConsumer extends WorkerHost {
  private fileCollectingSseConnections: UserConnections = new Map();

  constructor(private readonly webDavService: WebDavService) {
    super();
  }

  subscribe(username: string, res: Response): Observable<MessageEvent> {
    return SseService.subscribe(username, this.fileCollectingSseConnections, res);
  }

  async process(job: Job<JobData>): Promise<void> {
    const { username, userRole, item, operationType, total, processed } = job.data as CollectFileJobData;
    const failedPaths: string[] = [];

    const initFolderName = `${userRole}s/${username}/${FILE_PATHS.TRANSFER}/${FILE_PATHS.COLLECTED}`;
    try {
      await this.webDavService.createFolder(username, `${initFolderName}/${item.newFolderName}`, item.userName);

      if (operationType === LMN_API_COLLECT_OPERATIONS.CUT) {
        await this.webDavService.cutCollectedItems(username, item.originPath, item.destinationPath);
      } else {
        await this.webDavService.copyCollectedItems(username, {
          originFilePath: item.originPath,
          destinationFilePaths: [`${item.destinationPath}`],
        });
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
      studentName: username,
      percent,
      currentFilePath: FILE_PATHS.COLLECT,
      failedPaths,
    };

    SseService.sendEventToUser(username, this.fileCollectingSseConnections, progressDto, SSE_MESSAGE_TYPE.UPDATED);
  }
}

export default CollectFileConsumer;
