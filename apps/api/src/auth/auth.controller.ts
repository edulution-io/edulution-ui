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

import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Request } from 'express';
import AUTH_PATHS from '@libs/auth/constants/auth-paths';
import AuthRequestArgs from '@libs/auth/types/auth-request';
import { AUTH_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import type LoginQrSseDto from '@libs/auth/types/loginQrSse.dto';
import CustomHttpException from '../common/CustomHttpException';
import { Public } from '../common/decorators/public.decorator';
import AuthService from './auth.service';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import GetCurrentUserGroups from '../common/decorators/getCurrentUserGroups.decorator';

const { EDUI_OIDC_CONFIG_CACHE_TTL } = process.env;
const oidcConfigCacheTtl =
  EDUI_OIDC_CONFIG_CACHE_TTL === undefined || EDUI_OIDC_CONFIG_CACHE_TTL === ''
    ? AUTH_CACHE_TTL_MS
    : Number(EDUI_OIDC_CONFIG_CACHE_TTL);

@ApiTags(AUTH_PATHS.AUTH_ENDPOINT)
@Controller(AUTH_PATHS.AUTH_ENDPOINT)
class AuthController {
  constructor(private readonly authService: AuthService) {
    if (oidcConfigCacheTtl > 0) {
      Logger.debug(`OIDC Config Cache TTL: ${oidcConfigCacheTtl} ms`, AuthController.name);
    } else {
      Logger.debug(`OIDC Config Cache deactivated`, AuthController.name);
    }
  }

  @Public()
  @(oidcConfigCacheTtl > 0 ? UseInterceptors(CacheInterceptor) : () => {})
  @CacheTTL(oidcConfigCacheTtl)
  @Get(AUTH_PATHS.AUTH_OIDC_CONFIG_PATH)
  authconfig(@Req() req: Request) {
    return this.authService.authconfig(req);
  }

  @Public()
  @Post()
  authenticate(@Body() body: AuthRequestArgs) {
    return this.authService.authenticateUser(body);
  }

  @Get(AUTH_PATHS.AUTH_QRCODE)
  getQrCode(@GetCurrentUsername() username: string) {
    return this.authService.getQrCode(username);
  }

  @Post(AUTH_PATHS.AUTH_CHECK_TOTP)
  setupTotp(@GetCurrentUsername() username: string, @Body() body: { totp: string; secret: string }) {
    return this.authService.setupTotp(username, body);
  }

  @Public()
  @Get(`${AUTH_PATHS.AUTH_CHECK_TOTP}/:username`)
  getTotpInfo(@Param() params: { username: string }) {
    return this.authService.getTotpInfo(params.username);
  }

  @Put(AUTH_PATHS.AUTH_CHECK_TOTP)
  disableTotp(@GetCurrentUsername() username: string) {
    return this.authService.disableTotp(username);
  }

  @Put(`${AUTH_PATHS.AUTH_CHECK_TOTP}/:username`)
  disableTotpForUser(
    @GetCurrentUsername() currentUsername: string,
    @GetCurrentUserGroups() ldapGroups: string[],
    @Param() params: { username: string },
  ) {
    const { username } = params;
    Logger.log(`Disable TOTP for user ${username} by ${currentUsername}`);
    return this.authService.disableTotpForUser(username, ldapGroups);
  }

  @Public()
  @Post(AUTH_PATHS.AUTH_VIA_APP)
  loginViaApp(@Body() body: LoginQrSseDto, @Query('sessionId') sessionId: string) {
    if (!sessionId)
      throw new CustomHttpException(AuthErrorMessages.Unknown, HttpStatus.BAD_REQUEST, undefined, AuthController.name);
    return this.authService.loginViaApp(body, sessionId);
  }
}

export default AuthController;
