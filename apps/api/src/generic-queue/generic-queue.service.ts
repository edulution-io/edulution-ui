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

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { JobOptions, Queue } from 'bull';
import { QUEUE_NAMES } from '../common/queueNames/queueNames';

@Injectable()
class GenericQueueService {
  constructor(@InjectQueue(QUEUE_NAMES.GENERIC_QUEUE) private readonly queue: Queue) {}

  public async addJob<TData = unknown>(jobName: string, data: TData, options?: JobOptions): Promise<void> {
    await this.queue.add(jobName, data, options);
  }
}

export default GenericQueueService;
