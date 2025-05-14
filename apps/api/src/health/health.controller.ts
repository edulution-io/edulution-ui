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

import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
  HttpHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import { Public } from '../common/decorators/public.decorator';

const { EDUI_WEBDAV_URL, KEYCLOAK_API } = process.env;

@Controller(EDU_API_CONFIG_ENDPOINTS.HEALTH_CHECK)
class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
    private httpIndicator: HttpHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @HttpCode(HttpStatus.OK)
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  check() {}

  @Get('readiness')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.mongoose.pingCheck('mongodb'),
      () => this.httpIndicator.pingCheck('authServer', KEYCLOAK_API || ''),
      () => this.httpIndicator.pingCheck('lmnServer', new URL(EDUI_WEBDAV_URL || '').origin),
      () => this.disk.checkStorage('disk', { thresholdPercent: 0.8, path: '/' }),
    ]);
  }
}

export default HealthController;
