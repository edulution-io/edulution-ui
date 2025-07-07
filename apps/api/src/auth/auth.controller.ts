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

import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseInterceptors,
  Logger,
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
import GetCurrentUserGroups from '../common/decorators/getUserGroups.decorator';

@ApiTags(AUTH_PATHS.AUTH_ENDPOINT)
@Controller(AUTH_PATHS.AUTH_ENDPOINT)
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(AUTH_CACHE_TTL_MS)
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
