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

import { CallHandler, ExecutionContext, Inject, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type DeploymentTarget from '@libs/common/types/deployment-target';
import { DEPLOYMENT_TARGET_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import GlobalSettingsService from '../../global-settings/global-settings.service';

@Injectable()
class DeploymentTargetInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly globalSettingsService: GlobalSettingsService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest<{
      deploymentTarget?: DeploymentTarget;
    }>();

    let deploymentTarget = await this.cache.get<string>(DEPLOYMENT_TARGET_CACHE_KEY);

    if (!deploymentTarget) {
      Logger.verbose('deploymentTarget missing in redis cache, refreshing via DB', DeploymentTargetInterceptor.name);
      deploymentTarget = await this.globalSettingsService.setDeploymentTargetInCache();
    }

    req.deploymentTarget = deploymentTarget as DeploymentTarget;
    return next.handle();
  }
}

export default DeploymentTargetInterceptor;
