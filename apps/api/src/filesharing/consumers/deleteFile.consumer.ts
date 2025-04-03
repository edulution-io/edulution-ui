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
import JobData from '@libs/queue/constants/jobData';
import DeleteFileJobData from '@libs/queue/types/deleteFileJobData';
import WebDavService from '../../webdav/webDavService';

@Injectable()
class DeleteFileConsumer extends WorkerHost {
  constructor(private readonly webDavService: WebDavService) {
    super();
  }

  async process(job: Job<JobData>): Promise<void> {
    const { username, originFilePath } = job.data as DeleteFileJobData;

    const failedPaths: string[] = [];
    try {
      await this.webDavService.deletePath(username, originFilePath);
    } catch (error) {
      failedPaths.push(originFilePath);
    }
  }
}

export default DeleteFileConsumer;
