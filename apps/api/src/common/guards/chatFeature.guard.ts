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

import { CanActivate, ExecutionContext, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import CustomHttpException from '../CustomHttpException';
import AppConfigService from '../../appconfig/appconfig.service';
import GlobalSettingsService from '../../global-settings/global-settings.service';

@Injectable()
class ChatFeatureGuard implements CanActivate {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly globalSettingsService: GlobalSettingsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new CustomHttpException(
        AuthErrorMessages.Unauthorized,
        HttpStatus.UNAUTHORIZED,
        undefined,
        ChatFeatureGuard.name,
      );
    }

    const ldapGroups: string[] = user.ldapGroups || [];
    const adminGroups = await this.globalSettingsService.getAdminGroupsFromCache();

    if (getIsAdmin(ldapGroups, adminGroups)) {
      return true;
    }

    const chatConfig = await this.appConfigService.getAppConfigByName(APPS.CHAT);
    const extendedOptions = (chatConfig?.extendedOptions ?? {}) as Record<string, unknown>;

    const isEnabled = extendedOptions[ExtendedOptionKeys.CHAT_AI_CHAT_ENABLED] !== false;
    if (!isEnabled) {
      Logger.debug(`AI Chat disabled, denied ${user.preferred_username}`, ChatFeatureGuard.name);
      throw new CustomHttpException(
        AuthErrorMessages.Unauthorized,
        HttpStatus.FORBIDDEN,
        user.preferred_username,
        ChatFeatureGuard.name,
      );
    }

    const configuredGroups = (extendedOptions[ExtendedOptionKeys.CHAT_AI_CHAT_GROUPS] ?? []) as MultipleSelectorGroup[];
    const hasGroupAccess =
      configuredGroups.length > 0 && ldapGroups.some((userGroup) => configuredGroups.some((g) => g.path === userGroup));

    if (!hasGroupAccess) {
      Logger.debug(`Access denied for ${user.preferred_username}: not in AI Chat groups`, ChatFeatureGuard.name);
      throw new CustomHttpException(
        AuthErrorMessages.Unauthorized,
        HttpStatus.FORBIDDEN,
        user.preferred_username,
        ChatFeatureGuard.name,
      );
    }

    return true;
  }
}

export default ChatFeatureGuard;
