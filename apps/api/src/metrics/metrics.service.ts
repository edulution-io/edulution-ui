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

@Injectable()
class MetricsService {
  static getMetrics() {
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();
    const uptime = process.uptime().toFixed(2);

    return {
      uptime,
      cpuUserMs: cpu.user / 1000,
      cpuSystemMs: cpu.system / 1000,
      memory: {
        rssMB: +(mem.rss / 1024 / 1024).toFixed(1),
        heapUsedMB: +(mem.heapUsed / 1024 / 1024).toFixed(1),
        heapTotalMB: +(mem.heapTotal / 1024 / 1024).toFixed(1),
      },
    };
  }
}

export default MetricsService;
