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

import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import { PUBLIC_ROUTE_KEY, DYNAMIC_APP_ACCESS_PARAM_KEY } from '@libs/auth/constants/appAccessKeys';
import AppConfigService from '../../appconfig/appconfig.service';
import CustomHttpException from '../CustomHttpException';
import GlobalSettingsService from '../../global-settings/global-settings.service';
import { getCachedAccess, setCachedAccess } from './accessCache';

@Injectable()
class DynamicAppAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly appConfigService: AppConfigService,
    private readonly globalSettingsService: GlobalSettingsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const paramName =
      this.reflector.get<string>(DYNAMIC_APP_ACCESS_PARAM_KEY, context.getHandler()) ??
      this.reflector.get<string>(DYNAMIC_APP_ACCESS_PARAM_KEY, context.getClass()) ??
      'appName';

    const request: Request = context.switchToHttp().getRequest();
    const { user, params } = request;
    const domain = params[paramName];

    if (!domain) {
      return true;
    }

    if (!user) {
      throw new CustomHttpException(
        AuthErrorMessages.Unauthorized,
        HttpStatus.UNAUTHORIZED,
        domain,
        DynamicAppAccessGuard.name,
      );
    }

    const username = user.preferred_username;
    const cachedAccess = getCachedAccess(username, domain);

    if (cachedAccess !== null) {
      if (!cachedAccess) {
        throw new CustomHttpException(
          AuthErrorMessages.Unauthorized,
          HttpStatus.FORBIDDEN,
          username,
          DynamicAppAccessGuard.name,
        );
      }
      return true;
    }

    const ldapGroups: string[] = user.ldapGroups || [];
    const adminGroups = await this.globalSettingsService.getAdminGroupsFromCache();

    if (getIsAdmin(ldapGroups, adminGroups)) {
      setCachedAccess(username, domain, true);
      return true;
    }

    const allowedGroups = this.appConfigService.appAccessMap.get(domain);
    const hasAccess = allowedGroups ? ldapGroups.some((group) => allowedGroups.has(group)) : false;

    setCachedAccess(username, domain, hasAccess);

    if (!hasAccess) {
      throw new CustomHttpException(
        AuthErrorMessages.Unauthorized,
        HttpStatus.FORBIDDEN,
        username,
        DynamicAppAccessGuard.name,
      );
    }

    return true;
  }
}

export default DynamicAppAccessGuard;
