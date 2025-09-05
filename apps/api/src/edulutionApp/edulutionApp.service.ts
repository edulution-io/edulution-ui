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

import { Injectable } from '@nestjs/common';
import getDeploymentTarget from '@libs/common/utils/getDeploymentTarget';
import LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import UserDto from '@libs/user/types/user.dto';
import toEdulutionAppUser from '@libs/edulutionApp/utils/toEdulutionAppUser';
import LmnApiService from '../lmnApi/lmnApi.service';
import UsersService from '../users/users.service';

@Injectable()
class EdulutionAppService {
  constructor(
    private readonly userService: UsersService,
    private readonly lmnApiService: LmnApiService,
  ) {}

  async getAppUserInfomation(username: string) {
    const deploymentTarget = getDeploymentTarget();
    let lmnApiToken = '';
    let lmnInfo: LmnUserInfo = {} as LmnUserInfo;
    if (deploymentTarget === 'linuxmuster') {
      try {
        const password = await this.userService.getPassword(username);
        lmnApiToken = await this.lmnApiService.getLmnApiToken(username, password);
        lmnInfo = await this.lmnApiService.getUser(lmnApiToken, username);
      } catch (error) {
        lmnInfo = {} as LmnUserInfo;
      }
    }

    const user: UserDto | null = await this.userService.findOne(username);

    return toEdulutionAppUser({
      usernameFallback: username,
      user,
      lmn: lmnInfo,
    });
  }
}

export default EdulutionAppService;
