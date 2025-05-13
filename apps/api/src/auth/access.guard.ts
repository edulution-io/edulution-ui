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

import { CanActivate, ExecutionContext, HttpStatus, Injectable, mixin, Type } from '@nestjs/common';
import { Request } from 'express';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import AppConfigService from '../appconfig/appconfig.service';
import CustomHttpException from '../common/CustomHttpException';

const accessCache = new Map<string, { value: boolean; expiresAt: number }>();
const CACHE_TTL_MS = 60_000;

function AccessGuard(domain: string): Type<CanActivate> {
  @Injectable()
  class DomainAccessGuard implements CanActivate {
    constructor(private readonly appConfigService: AppConfigService) {}

    canActivate(context: ExecutionContext): boolean {
      const request: Request = context.switchToHttp().getRequest();
      const { user } = request;

      if (!user) {
        throw new CustomHttpException(
          AuthErrorMessages.Unauthorized,
          HttpStatus.UNAUTHORIZED,
          undefined,
          DomainAccessGuard.name,
        );
      }

      const username = user.preferred_username;
      const cacheKey = `${username}::${domain}`;
      const cached = accessCache.get(cacheKey);

      if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
      }

      const ldapGroups: string[] = user.ldapGroups || [];

      if (ldapGroups.includes(GroupRoles.SUPER_ADMIN)) {
        accessCache.set(cacheKey, { value: true, expiresAt: Date.now() + CACHE_TTL_MS });
        return true;
      }

      const allowedGroups = this.appConfigService.appAccessMap.get(domain) || [];
      const hasAccess = ldapGroups.some((group) => allowedGroups.includes(group));

      if (!hasAccess) {
        accessCache.set(cacheKey, { value: false, expiresAt: Date.now() + CACHE_TTL_MS });
        throw new CustomHttpException(
          AuthErrorMessages.Unauthorized,
          HttpStatus.UNAUTHORIZED,
          undefined,
          DomainAccessGuard.name,
        );
      }

      accessCache.set(cacheKey, { value: true, expiresAt: Date.now() + CACHE_TTL_MS });
      return true;
    }
  }

  return mixin(DomainAccessGuard);
}

export default AccessGuard;
