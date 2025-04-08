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

import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import QueueService from './queue.service';
import QUEUE_CONSTANTS from '@libs/queue/constants/queueConstants';

@Injectable()
class QueueStartupService implements OnModuleInit {
  constructor(private readonly queueService: QueueService) {}

  async onModuleInit() {
    const redisHost = process.env.REDIS_HOST ?? 'localhost';
    const redisPort = +(process.env.REDIS_PORT ?? 6379);
    const redis = new Redis({ host: redisHost, port: redisPort });

    const userIds = await this.scanUserIds(redis, QUEUE_CONSTANTS.PREFIX);

    await redis.quit();

    await Promise.all(
      userIds.map((userId) => {
        const queue = this.queueService.getOrCreateQueueForUser(userId);
        return queue.obliterate({ force: true });
      }),
    );
  }

  private async scanUserIds(
    redis: Redis,
    queuePrefix: string,
    cursor = '0',
    userIds = new Set<string>(),
  ): Promise<string[]> {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `bull:${queuePrefix}*`, 'COUNT', 100);

    keys.forEach((key) => {
      if (key.startsWith(`bull:${queuePrefix}`)) {
        const queueNamePlusSuffix = key.slice('bull:'.length);
        const [queueName] = queueNamePlusSuffix.split(':');
        const userId = queueName.replace(queuePrefix, '');
        userIds.add(userId);
      }
    });

    if (nextCursor === '0') {
      return Array.from(userIds);
    }
    return this.scanUserIds(redis, queuePrefix, nextCursor, userIds);
  }
}

export default QueueStartupService;
