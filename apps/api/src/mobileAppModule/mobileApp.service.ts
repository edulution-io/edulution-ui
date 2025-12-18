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

import { Injectable } from '@nestjs/common';
import LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import getMobileAppUserDto from '@libs/mobileApp/utils/getMobileAppUserDto';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import buildUserShares from '@libs/mobileApp/utils/buildUserShares';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import { ConfigService } from '@nestjs/config';
import LmnApiService from '../lmnApi/lmnApi.service';
import UsersService from '../users/users.service';
import GlobalSettingsService from '../global-settings/global-settings.service';
import WebdavSharesService from '../webdav/shares/webdav-shares.service';

@Injectable()
class MobileAppService {
  constructor(
    private readonly userService: UsersService,
    private readonly globalSettingsService: GlobalSettingsService,
    private readonly lmnApiService: LmnApiService,
    private readonly webdavSharesService: WebdavSharesService,
    private readonly configService: ConfigService,
  ) {}

  private async fetchLmnData(username: string, globalSettings: GlobalSettingsDto) {
    if (globalSettings.general.deploymentTarget !== DEPLOYMENT_TARGET.LINUXMUSTER) {
      return { token: '', info: {} as LmnUserInfo };
    }

    try {
      const token = await this.lmnApiService.getLmnApiToken(username);
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
      const edulutionVersion = this.configService.get<string>('version');

      return getMobileAppUserDto({
        usernameFallback: username,
        user,
        globalSettings: globalSettingsDto,
        lmn: lmnData.info,
        userShares,
        totpCreatedAt: user?.totpCreatedAt,
        edulutionVersion,
      });
    } catch {
      return {};
    }
  }

  async getTotpInfo(username: string) {
    const user = await this.userService.findOne(username, { mfaEnabled: 1, totpSecret: 1, totpCreatedAt: 1 });

    if (!user || !user.mfaEnabled) {
      return { secret: null, createdAt: null };
    }

    return {
      secret: user.totpSecret || null,
      createdAt: user.totpCreatedAt || null,
    };
  }
}

export default MobileAppService;
