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

import { Processor, WorkerHost } from '@nestjs/bullmq';
import FILESHARING_QUEUE_NAMES from '@libs/filesharing/constants/queueName';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import DuplicateFileJobData from '@libs/queue/types/duplicateFileJobData';
import FilesharingService from '../filesharing.service';

@Processor(FILESHARING_QUEUE_NAMES.MOVE_QUEUE, { concurrency: 1 })
class FilesharingMoveFileConsumer extends WorkerHost {
  constructor(private readonly fileSharingService: FilesharingService) {
    super();
  }

  async process(job: Job<DuplicateFileJobData>): Promise<void> {
    const { username } = job.data;
    const client = await this.fileSharingService.getClient(username);
    Logger.log(client);
  }
}

export default FilesharingMoveFileConsumer;
