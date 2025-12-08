/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
    const webdavShares = await this.webdavSharesService.findAllWebdavServers();

    const results = await Promise.all(
      webdavShares.map(async (share) => {
        if (!share.webdavShareId) {
          return { [share.displayName]: { status: 'down' as const, message: 'Missing ID' } };
        }

        try {
          const result = await this.httpIndicator.pingCheck(share.displayName, share.url, {
            httpClient: this.httpService,
            validateStatus: (status) => [200, 401, 403].includes(status),
          });
          Logger.verbose(`WebDAV Share is ${JSON.stringify(result)}`, HealthService.name);

          await this.webdavSharesService.updateWebdavShare(share.webdavShareId, {
            lastChecked: new Date(),
            status: result[share.displayName].status,
          });

          return result;
        } catch (e) {
          Logger.warn(`WebDAV Share ${share.displayName} is down`, HealthService.name);

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
