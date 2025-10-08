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

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import AppConfigService from '../../appconfig/appconfig.service';

@Injectable()
class IsPublicAppGuard implements CanActivate {
  constructor(private readonly appConfigService: AppConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { appName } = request.params;
    const appConfig = await this.appConfigService.getAppConfigHasPublicAssets(appName);
    if (!appConfig) {
      return false;
    }
    return true;
  }
}

export default IsPublicAppGuard;
