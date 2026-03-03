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

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import APPS from '@libs/appconfig/constants/apps';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import WopiAccessToken from '@libs/filesharing/types/wopiAccessToken';
import { WOPI_TOKEN_EXPIRY, WOPI_TOKEN_TTL_MS } from '@libs/filesharing/constants/wopi';
import CustomHttpException from '../common/CustomHttpException';
import AppConfigService from '../appconfig/appconfig.service';

interface WopiTokenPayload {
  username: string;
  filePath: string;
  share: string;
  canWrite: boolean;
  jti: string;
}

@Injectable()
class CollaboraService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private async getWopiSecret(): Promise<string> {
    const appConfig = await this.appConfigService.getAppConfigByName(APPS.FILE_SHARING);
    const secret = appConfig?.extendedOptions?.[ExtendedOptionKeys.COLLABORA_WOPI_SECRET] as string;

    if (!secret) {
      throw new CustomHttpException(
        FileSharingErrorMessage.AppNotProperlyConfigured,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        CollaboraService.name,
      );
    }

    return secret;
  }

  async generateWopiToken(
    username: string,
    filePath: string,
    share: string,
    canWrite: boolean,
  ): Promise<WopiAccessToken> {
    Logger.log(`Generating WOPI token for ${username}`, CollaboraService.name);
    const secret = await this.getWopiSecret();

    const payload: WopiTokenPayload = {
      username,
      filePath,
      share,
      canWrite,
      jti: randomUUID(),
    };

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: WOPI_TOKEN_EXPIRY,
    });

    return {
      accessToken,
      accessTokenTTL: Date.now() + WOPI_TOKEN_TTL_MS,
    };
  }

  async validateWopiToken(token: string): Promise<WopiTokenPayload> {
    const secret = await this.getWopiSecret();

    try {
      return this.jwtService.verify<WopiTokenPayload>(token, { secret });
    } catch {
      throw new CustomHttpException(
        FileSharingErrorMessage.WopiTokenInvalid,
        HttpStatus.UNAUTHORIZED,
        undefined,
        CollaboraService.name,
      );
    }
  }
}

export default CollaboraService;
