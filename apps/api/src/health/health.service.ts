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

import { Injectable, Logger } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheckService,
  HttpHealthIndicator,
  MongooseHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { HttpService } from '@nestjs/axios';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import { Interval } from '@nestjs/schedule';
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

  @Interval(30_000)
  private async checkWebDavServer(): Promise<HealthIndicatorResult> {
    const webdavShares = await this.webdavSharesService.findAllWebdavShares([GroupRoles.SUPER_ADMIN]);

    const results = await Promise.all(
      webdavShares.map(async (share) => {
        if (!share.webdavShareId) {
          return { [share.displayName]: { status: 'down' as const, message: 'Missing ID' } };
        }

        const { origin } = new URL(share.url);

        try {
          const result = await this.httpIndicator.pingCheck(share.displayName, origin, {
            httpClient: this.httpService,
          });
          Logger.debug(`WebDAV Share is ${JSON.stringify(result)}`, HealthService.name);

          await this.webdavSharesService.updateWebdavShare(share.webdavShareId, {
            lastChecked: new Date(),
            status: result[share.displayName].status,
          });

          return result;
        } catch (e) {
          Logger.debug(`WebDAV Share ${share.displayName} is down`, HealthService.name);

          await this.webdavSharesService.updateWebdavShare(share.webdavShareId, {
            lastChecked: new Date(),
            status: 'down',
          });

          return {
            [share.displayName]: {
              status: 'down' as const,
              message: (e as Error).message,
            },
          };
        }
      }),
    );

    return results.reduce<HealthIndicatorResult>((acc, curr) => ({ ...acc, ...curr }), {});
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
