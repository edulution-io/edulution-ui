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
import {
  DiskHealthIndicator,
  HealthCheckService,
  HttpHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { HttpService } from '@nestjs/axios';

const { EDUI_WEBDAV_URL, KEYCLOAK_API, EDUI_DISK_SPACE_THRESHOLD } = process.env;

@Injectable()
class HealthService {
  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
    private httpIndicator: HttpHealthIndicator,
    private disk: DiskHealthIndicator,
    private httpService: HttpService,
  ) {}

  async checkApiHealth() {
    const rawThreshold = Number(EDUI_DISK_SPACE_THRESHOLD);

    const isValidThreshold = !Number.isNaN(rawThreshold) && rawThreshold >= 0 && rawThreshold <= 1;

    const thresholdPercent = isValidThreshold ? Math.round(rawThreshold * 100) / 100 : 0.95;

    return this.health.check([
      () => this.mongoose.pingCheck('mongodb'),
      () => this.httpIndicator.pingCheck('authServer', KEYCLOAK_API || ''),
      () =>
        this.httpIndicator.pingCheck('lmnServer', new URL(EDUI_WEBDAV_URL || '').origin, {
          httpClient: this.httpService,
        }),
      () => this.disk.checkStorage('disk', { thresholdPercent, path: '/' }),
    ]);
  }
}

export default HealthService;
