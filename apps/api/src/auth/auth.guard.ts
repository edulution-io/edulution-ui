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
class AuthenticationGuard implements CanActivate {
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
          throw new CustomHttpException(
            AuthErrorMessages.TokenExpired,
            HttpStatus.UNAUTHORIZED,
            err,
            AuthenticationGuard.name,
          );
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
      AuthenticationGuard.name,
    );
  }
}

export default AuthenticationGuard;
