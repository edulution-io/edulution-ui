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
import { OnEvent } from '@nestjs/event-emitter';
import { Request } from 'express';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import EVENT_EMITTER_EVENTS from '@libs/appconfig/constants/eventEmitterEvents';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import { APP_ACCESS_KEY, PUBLIC_ROUTE_KEY } from '@libs/auth/constants/appAccessKeys';
import AppConfigService from '../appconfig/appconfig.service';
import CustomHttpException from '../common/CustomHttpException';
import GlobalSettingsService from '../global-settings/global-settings.service';
import { getCachedAccess, setCachedAccess, clearAccessCache } from '../common/guards/accessCache';

@Injectable()
class AccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly appConfigService: AppConfigService,
    private readonly globalSettingsService: GlobalSettingsService,
  ) {}

  @OnEvent(EVENT_EMITTER_EVENTS.APP_ACCESS_MAP_UPDATED as string)
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/class-methods-use-this
  handleAppAccessMapUpdated() {
    clearAccessCache();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const domain =
      this.reflector.get<string>(APP_ACCESS_KEY, context.getHandler()) ??
      this.reflector.get<string>(APP_ACCESS_KEY, context.getClass());

    if (!domain) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new CustomHttpException(AuthErrorMessages.Unauthorized, HttpStatus.UNAUTHORIZED, domain, AccessGuard.name);
    }

    const username = user.preferred_username;
    const cachedAccess = getCachedAccess(username, domain);

    if (cachedAccess !== null) {
      if (!cachedAccess) {
        throw new CustomHttpException(AuthErrorMessages.Unauthorized, HttpStatus.FORBIDDEN, username, AccessGuard.name);
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
      throw new CustomHttpException(AuthErrorMessages.Unauthorized, HttpStatus.FORBIDDEN, username, AccessGuard.name);
    }

    return true;
  }
}

export default AccessGuard;
