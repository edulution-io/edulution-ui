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
import { Request } from 'express';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import AppConfigService from '../../appconfig/appconfig.service';
import CustomHttpException from '../CustomHttpException';
import { PUBLIC_ROUTE_KEY } from '../decorators/public.decorator';
import GlobalSettingsService from '../../global-settings/global-settings.service';

const DYNAMIC_APP_ACCESS_PARAM_KEY = 'dynamic_app_access_param';

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
        undefined,
        DynamicAppAccessGuard.name,
      );
    }

    const ldapGroups: string[] = user.ldapGroups || [];
    const adminGroups = await this.globalSettingsService.getAdminGroupsFromCache();

    if (getIsAdmin(ldapGroups, adminGroups)) {
      return true;
    }

    const allowedGroups = this.appConfigService.appAccessMap.get(domain);
    const hasAccess = allowedGroups ? ldapGroups.some((group) => allowedGroups.has(group)) : false;

    if (!hasAccess) {
      throw new CustomHttpException(
        AuthErrorMessages.Unauthorized,
        HttpStatus.FORBIDDEN,
        undefined,
        DynamicAppAccessGuard.name,
      );
    }

    return true;
  }
}

export { DYNAMIC_APP_ACCESS_PARAM_KEY };
export default DynamicAppAccessGuard;
