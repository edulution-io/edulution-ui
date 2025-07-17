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

import { createParamDecorator, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import type DeploymentTarget from '@libs/common/types/deployment-target';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import SPECIAL_SCHOOLS from '@libs/common/constants/specialSchools';
import CustomHttpException from '../CustomHttpException';

const VALID_TARGETS = new Set<DeploymentTarget>(Object.values(DEPLOYMENT_TARGET));

const GetCurrentOrganisationPrefix = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request: Request = ctx.switchToHttp().getRequest();
  const envTarget = process.env.EDUI_DEPLOYMENT_TARGET ?? DEPLOYMENT_TARGET.LINUXMUSTER;
  const target: DeploymentTarget = VALID_TARGETS.has(envTarget as DeploymentTarget)
    ? (envTarget as DeploymentTarget)
    : DEPLOYMENT_TARGET.LINUXMUSTER;

  switch (target) {
    case DEPLOYMENT_TARGET.GENERIC:
      return SPECIAL_SCHOOLS.GLOBAL;

    case DEPLOYMENT_TARGET.LINUXMUSTER:
      if (!request.user?.school) {
        throw new CustomHttpException(
          CommonErrorMessages.WRONG_CONFIG,
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Missing school in JWT`,
        );
      }
      return request.user.school;

    default:
      throw new CustomHttpException(
        CommonErrorMessages.WRONG_CONFIG,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unsupported deployment target: ${envTarget}`,
      );
  }
});

export default GetCurrentOrganisationPrefix;
