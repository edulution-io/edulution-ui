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

import { createParamDecorator, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import SPECIAL_SCHOOLS from '@libs/common/constants/specialSchools';
import type DeploymentTarget from '@libs/common/types/deployment-target';
import CustomHttpException from '../CustomHttpException';

const GetCurrentOrganisationPrefix = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request: Request & { deploymentTarget: DeploymentTarget } = ctx.switchToHttp().getRequest();
  const target = request.deploymentTarget;

  switch (target) {
    case DEPLOYMENT_TARGET.GENERIC:
      return SPECIAL_SCHOOLS.GLOBAL;

    case DEPLOYMENT_TARGET.LINUXMUSTER:
      if (!request.user?.school) {
        throw new CustomHttpException(
          CommonErrorMessages.WRONG_SEVER_CONFIG,
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Missing school in JWT`,
        );
      }
      return request.user.school;

    default:
      throw new CustomHttpException(
        CommonErrorMessages.WRONG_SEVER_CONFIG,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unsupported deployment target`,
      );
  }
});

export default GetCurrentOrganisationPrefix;
