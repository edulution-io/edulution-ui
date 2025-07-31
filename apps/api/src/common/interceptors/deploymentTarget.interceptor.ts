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
