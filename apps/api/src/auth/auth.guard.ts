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
import { CanActivate, ExecutionContext, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { parse } from 'cookie';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import PUBLIC_KEY_FILE_PATH from '@libs/common/constants/pubKeyFilePath';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import CustomHttpException from '../common/CustomHttpException';
import { PUBLIC_ROUTE_KEY } from '../common/decorators/public.decorator';

@Injectable()
class AuthenticationGuard implements CanActivate {
  private token: string;

  private readonly pubKey: string;

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {
    this.pubKey = readFileSync(PUBLIC_KEY_FILE_PATH, 'utf8');
  }

  private static extractToken(request: Request): string {
    const tokenFromQuery = request.query.token as string;
    if (tokenFromQuery) {
      return tokenFromQuery;
    }

    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }

    const cookies = parse(request.headers.cookie || '');
    return cookies.authToken || '';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(PUBLIC_ROUTE_KEY, context.getHandler());
    if (isPublic) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    this.token = AuthenticationGuard.extractToken(request);

    try {
      request.user = await this.jwtService.verifyAsync<JWTUser>(this.token, {
        publicKey: this.pubKey,
        algorithms: ['RS256'],
      });
      request.token = this.token;

      return true;
    } catch (error) {
      const safeRequest = {
        method: request.method,
        url: request.url,
        headers: {
          authorization: request.headers.authorization,
          cookie: request.headers.cookie,
          'content-type': request.headers['content-type'],
        },
        params: request.params,
        query: request.query,
        body: JSON.stringify(request.body),
      };
      Logger.verbose(`Auth failed for request: ${JSON.stringify(safeRequest)}`, AuthenticationGuard.name);

      throw new CustomHttpException(
        AuthErrorMessages.TokenExpired,
        HttpStatus.UNAUTHORIZED,
        error,
        AuthenticationGuard.name,
      );
    }
  }
}

export default AuthenticationGuard;
