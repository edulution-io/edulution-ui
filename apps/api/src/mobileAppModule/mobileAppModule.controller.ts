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

import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Injectable } from '@nestjs/common';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import MobileAppModuleService from './mobileAppModule.service';
import GetCurrentUserGroups from '../common/decorators/getCurrentUserGroups.decorator';

@ApiTags('mobile-app')
@Controller('mobile-app')
@Injectable()
class MobileAppModuleController {
  constructor(private readonly edulutionAppService: MobileAppModuleService) {}

  @Get('user-data')
  async getAppUserData(@GetCurrentUsername() username: string, @GetCurrentUserGroups() currentUserGroups: string[]) {
    return this.edulutionAppService.getAppUserData(username, currentUserGroups);
  }
}

export default MobileAppModuleController;
