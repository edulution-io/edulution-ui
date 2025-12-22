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
