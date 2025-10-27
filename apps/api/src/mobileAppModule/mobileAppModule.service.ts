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
import getMobileAppUserDto from '@libs/mobileApp/utils/getMobileAppUserDto';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import buildUserShares from '@libs/mobileApp/utils/buildUserShares';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
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

  private async fetchLmnData(username: string, globalSettings: GlobalSettingsDto) {
    if (globalSettings.general.deploymentTarget !== DEPLOYMENT_TARGET.LINUXMUSTER) {
      return { token: '', info: {} as LmnUserInfo };
    }

    try {
      const password = await this.userService.getPassword(username);
      const token = await this.lmnApiService.getLmnApiToken(username, password);
      const info = await this.lmnApiService.getUser(token, username);
      return { token, info };
    } catch (error) {
      return { token: '', info: {} as LmnUserInfo };
    }
  }

  private async fetchWebdavData(currentUserGroups: string[]) {
    const [shares] = await Promise.all([this.webdavSharesService.findAllWebdavShares(currentUserGroups)]);

    return {
      shares: shares as WebdavShareDto[] | undefined,
    };
  }

  async getAppUserData(username: string, currentUserGroups: string[]) {
    try {
      const globalSettingsDto: GlobalSettingsDto =
        (await this.globalSettingsService.getGlobalSettings()) as GlobalSettingsDto;

      const lmnData = await this.fetchLmnData(username, globalSettingsDto);
      const webdavData = await this.fetchWebdavData(currentUserGroups);
      const userShares = buildUserShares(webdavData.shares, lmnData.info);
      const user = await this.userService.findOne(username);

      return getMobileAppUserDto({
        usernameFallback: username,
        user,
        globalSettings: globalSettingsDto,
        lmn: lmnData.info,
        userShares,
      });
    } catch {
      return {};
    }
  }
}

export default MobileAppModuleService;
