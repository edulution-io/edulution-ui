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

import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import IORedis from 'ioredis';
import redisConnection from '../redis.connection';

@Injectable()
export default class DevCacheFlushService implements OnApplicationBootstrap {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async onApplicationBootstrap() {
    if (process.env.NODE_ENV !== 'development') return;

    const client = new IORedis(redisConnection);
    await client.flushdb();
    await client.quit();
  }
}
