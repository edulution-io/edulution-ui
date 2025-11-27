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

import { readFileSync } from 'fs';
import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import PUBLIC_KEY_FILE_PATH from '@libs/common/constants/pubKeyFilePath';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import CustomHttpException from '../common/CustomHttpException';
import { PUBLIC_ROUTE_KEY } from '../common/decorators/public.decorator';
import extractToken from '../common/utils/extractToken';

@Injectable()
class AuthGuard implements CanActivate {
  private readonly pubKey: string;

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {
    this.pubKey = readFileSync(PUBLIC_KEY_FILE_PATH, 'utf8');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(PUBLIC_ROUTE_KEY, context.getHandler());

    const request: Request = context.switchToHttp().getRequest();
    const token = extractToken(request);

    if (token) {
      try {
        request.user = await this.jwtService.verifyAsync<JWTUser>(token, {
          publicKey: this.pubKey,
          algorithms: ['RS256'],
        });
        request.token = token;
      } catch (err) {
        if (!isPublic) {
          throw new CustomHttpException(AuthErrorMessages.TokenExpired, HttpStatus.UNAUTHORIZED, err, AuthGuard.name);
        }
      }
    }

    if (isPublic || request.user) {
      return true;
    }

    throw new CustomHttpException(
      AuthErrorMessages.TokenExpired,
      HttpStatus.UNAUTHORIZED,
      'No JWT provided',
      AuthGuard.name,
    );
  }
}

export default AuthGuard;
