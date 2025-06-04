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
import { Job } from 'bullmq';
import FileOperationQueueJobData from '@libs/queue/constants/fileOperationQueueJobData';
import CreateFolderJobData from '@libs/queue/types/createFolderJobData';
import WebdavService from '../../webdav/webdav.service';

@Injectable()
class CreateFolderConsumer extends WorkerHost {
  constructor(private readonly webDavService: WebdavService) {
    super();
  }

  async process(job: Job<FileOperationQueueJobData>): Promise<void> {
    const { username, basePath, folderPath } = job.data as CreateFolderJobData;
    await this.webDavService.ensureFolderExists(username, basePath, folderPath);
  }
}

export default CreateFolderConsumer;
