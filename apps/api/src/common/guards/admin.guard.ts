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
import { Request } from 'express';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import CustomHttpException from '../CustomHttpException';
import GlobalSettingsService from '../../global-settings/global-settings.service';

@Injectable()
class AdminGuard implements CanActivate {
  constructor(private readonly globalSettingsService: GlobalSettingsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new CustomHttpException(AuthErrorMessages.Unknown, HttpStatus.NOT_FOUND, undefined, AdminGuard.name);
    }

    const ldapGroups = user.ldapGroups || [];

    const adminGroups = await this.globalSettingsService.getAdminGroupsFromCache();

    if (getIsAdmin(ldapGroups, adminGroups)) {
      return true;
    }
    throw new CustomHttpException(AuthErrorMessages.Unauthorized, HttpStatus.UNAUTHORIZED, undefined, AdminGuard.name);
  }
}

export default AdminGuard;
