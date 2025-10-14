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
import LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import UserDto from '@libs/user/types/user.dto';
import getMobileAppUserDto from '@libs/mobileApp/utils/getMobileAppUserDto';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import getStringFromArray from '@libs/common/utils/getStringFromArray';
import WEBDAV_SHARE_TYPE from '@libs/filesharing/constants/webdavShareType';
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import LmnApiService from '../lmnApi/lmnApi.service';
import UsersService from '../users/users.service';
import GlobalSettingsService from '../global-settings/global-settings.service';
import WebdavSharesService from '../webdav/shares/webdav-shares.service';

@Injectable()
class MobileAppModuleService {
  constructor(
    private readonly userService: UsersService,
    private readonly globalSettingsService: GlobalSettingsService,
    private readonly lmnApiService: LmnApiService,
    private readonly webdavSharesService: WebdavSharesService,
  ) {}

  async getAppUserData(username: string) {
    const globalSettingsDto: GlobalSettingsDto =
      (await this.globalSettingsService.getGlobalSettings()) as GlobalSettingsDto;

    let lmnApiToken = '';
    let lmnInfo: LmnUserInfo = {} as LmnUserInfo;
    if (globalSettingsDto.general.deploymentTarget === DEPLOYMENT_TARGET.LINUXMUSTER) {
      try {
        const password = await this.userService.getPassword(username);
        lmnApiToken = await this.lmnApiService.getLmnApiToken(username, password);
        lmnInfo = await this.lmnApiService.getUser(lmnApiToken, username);
      } catch (error) {
        lmnInfo = {} as LmnUserInfo;
      }
    }

    const webdavServers = await this.webdavSharesService.findAllWebdavServers();

    const isFileEduProxy = !!webdavServers.find((server) => server.type === WEBDAV_SHARE_TYPE.EDU_FILE_PROXY);

    const homeDirectory = isFileEduProxy ? lmnInfo.homeDirectory : getStringFromArray(lmnInfo.sophomorixIntrinsic2);

    const user: UserDto | null = await this.userService.findOne(username);

    return getMobileAppUserDto({
      homeDirectory,
      usernameFallback: username,
      user,
      globalSettings: globalSettingsDto,
      lmn: lmnInfo,
    });
  }
}

export default MobileAppModuleService;
