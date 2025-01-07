import { readFileSync } from 'fs';
import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import CustomHttpException from '@libs/error/CustomHttpException';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import PUBLIC_KEY_FILE_PATH from '@libs/common/constants/pubKeyFilePath';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import { PUBLIC_ROUTE_KEY } from '../common/decorators/public.decorator';

@Injectable()
class AuthenticationGuard implements CanActivate {
  private token: string;

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  private static extractTokenFromHeader(request: Request): string {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : '';
  }

  private static extractTokenFromQuery(request: Request): string {
    const { token } = request.query;
    if (token) {
      return token as string;
    }
    return '';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(PUBLIC_ROUTE_KEY, context.getHandler());
    if (isPublic) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    this.token = AuthenticationGuard.extractTokenFromHeader(request);
    if (!this.token) {
      this.token = AuthenticationGuard.extractTokenFromQuery(request);
    }

    try {
      const pubKey = readFileSync(PUBLIC_KEY_FILE_PATH, 'utf8');

      request.user = await this.jwtService.verifyAsync<JWTUser>(this.token, {
        publicKey: pubKey,
        algorithms: ['RS256'],
      });
      request.token = this.token;

      return true;
    } catch (error) {
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
