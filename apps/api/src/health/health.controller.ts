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
