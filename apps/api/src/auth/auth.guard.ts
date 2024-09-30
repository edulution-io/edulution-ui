import { readFileSync } from 'fs';
import { CanActivate, ExecutionContext, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import CustomHttpException from '@libs/error/CustomHttpException';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import PUBLIC_KEY_FILE_PATH from '@libs/common/contants/pubKeyFilePath';
import JWTUser from '../types/JWTUser';
import { PUBLIC_ROUTE_KEY } from '../common/decorators/public.decorator';

@Injectable()
class AuthenticationGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  private static extractTokenFromHeader(request: Request): string {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : '';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(PUBLIC_ROUTE_KEY, context.getHandler());
    if (isPublic) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const token = AuthenticationGuard.extractTokenFromHeader(request);

    try {
      const pubKey = readFileSync(PUBLIC_KEY_FILE_PATH, 'utf8');

      request.user = await this.jwtService.verifyAsync<JWTUser>(token, {
        publicKey: pubKey,
        algorithms: ['RS256'],
      });
      request.token = token;

      return true;
    } catch (e) {
      Logger.warn(e, AuthenticationGuard.name);
      throw new CustomHttpException(AuthErrorMessages.TokenExpired, HttpStatus.UNAUTHORIZED);
    }
  }
}

export default AuthenticationGuard;
