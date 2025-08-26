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
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { HttpService } from '@nestjs/axios';
import WebdavSharesService from '../webdav/shares/webdav-shares.service';

const { KEYCLOAK_API, EDUI_DISK_SPACE_THRESHOLD } = process.env;

@Injectable()
class HealthService {
  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
    private httpIndicator: HttpHealthIndicator,
    private disk: DiskHealthIndicator,
    private httpService: HttpService,
    private webdavSharesService: WebdavSharesService,
  ) {}

  async checkEduApiResponding() {
    return this.health.check([() => this.checkMongo()]);
  }

  async checkEduApiHealth() {
    return this.health.check([() => this.checkMongo(), () => this.checkDiskStorage()]);
  }

  async getEduApiStats() {
    return this.health.check([
      () => this.checkMongo(),
      () => this.checkAuthServer(),
      () => this.checkWebDavServer(),
      () => this.checkDiskStorage(),
    ]);
  }

  private checkMongo(): Promise<HealthIndicatorResult> {
    return this.mongoose.pingCheck('mongodb');
  }

  private checkAuthServer(): Promise<HealthIndicatorResult> {
    const url = KEYCLOAK_API || '';
    return this.httpIndicator.pingCheck('authServer', url);
  }

  private async checkWebDavServer(): Promise<HealthIndicatorResult> {
    const webdavServerUrl = await this.webdavSharesService.getWebdavSharePath();
    const { origin } = new URL(webdavServerUrl || '');
    return this.httpIndicator.pingCheck('lmnServer', origin, {
      httpClient: this.httpService,
    });
  }

  private checkDiskStorage(): Promise<HealthIndicatorResult> {
    return this.disk.checkStorage('disk', {
      thresholdPercent: HealthService.getThresholdPercent(),
      path: '/',
    });
  }

  private static getThresholdPercent(): number {
    const raw = Number(EDUI_DISK_SPACE_THRESHOLD);
    if (!Number.isFinite(raw) || raw < 0 || raw > 1) {
      return 0.95;
    }
    return Math.round(raw * 100) / 100;
  }
}

export default HealthService;
