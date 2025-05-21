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

import { Controller, Get, UseGuards } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import LocalhostGuard from '../common/guards/localhost.guard';
import { Public } from '../common/decorators/public.decorator';
import HealthService from './health.service';

@Controller(EDU_API_CONFIG_ENDPOINTS.HEALTH_CHECK)
class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthService.checkEduApiResponding();
  }

  @Public()
  @UseGuards(LocalhostGuard)
  @Get('check')
  @HealthCheck()
  readiness() {
    return this.healthService.checkEduApiHealth();
  }

  @Get('stats')
  getStats() {
    return this.healthService.getEduApiStats();
  }
}

export default HealthController;
