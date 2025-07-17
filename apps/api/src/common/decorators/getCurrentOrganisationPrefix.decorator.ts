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
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import CustomHttpException from '../CustomHttpException';

const GetCurrentOrganisationPrefix = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request: Request = ctx.switchToHttp().getRequest();
  const target = process.env.EDUI_DEPLOYMENT_TARGET || DEPLOYMENT_TARGET.LINUXMUSTER;

  if (target === DEPLOYMENT_TARGET.GENERIC) {
    return 'global';
  }

  if (target === DEPLOYMENT_TARGET.LINUXMUSTER && request.user?.school) {
    return request.user.school;
  }

  throw new CustomHttpException(
    CommonErrorMessages.WRONG_CONFIG,
    HttpStatus.INTERNAL_SERVER_ERROR,
    `Missing school in JWT`,
  );
});

export default GetCurrentOrganisationPrefix;
