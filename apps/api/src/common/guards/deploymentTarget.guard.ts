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

import { CanActivate, ExecutionContext, Injectable, Inject, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import type DeploymentTarget from '@libs/common/types/deployment-target';
import { DEPLOYMENT_TARGET_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import CustomHttpException from '../CustomHttpException';

@Injectable()
class DeploymentTargetGuard implements CanActivate {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<{
      user?: { school?: string };
      deploymentTarget?: DeploymentTarget;
    }>();

    const deploymentTarget = await this.cache.get<string>(DEPLOYMENT_TARGET_CACHE_KEY);
    if (!deploymentTarget) {
      throw new CustomHttpException(
        CommonErrorMessages.WRONG_CONFIG,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Deployment target not found',
        DeploymentTargetGuard.name,
      );
    }

    if (!Object.values(DEPLOYMENT_TARGET).includes(deploymentTarget as DeploymentTarget)) {
      throw new CustomHttpException(
        CommonErrorMessages.WRONG_CONFIG,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Invalid deployment target: ${deploymentTarget}`,
        DeploymentTargetGuard.name,
      );
    }
    req.deploymentTarget = deploymentTarget as DeploymentTarget;
    return true;
  }
}

export default DeploymentTargetGuard;
