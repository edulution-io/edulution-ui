import * as fs from 'fs';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
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
      const pubKeyPath = process.env.PUBLIC_KEY_FILE_PATH as string;
      const pubKey = fs.readFileSync(pubKeyPath, 'utf8');

      const decoded: JWTUser = await this.jwtService.verifyAsync<JWTUser>(token, {
        publicKey: pubKey,
        algorithms: ['RS256'],
      });

      request.user = decoded;
      request.token = token;

      return true;
    } catch (e) {
      Logger.warn(e, AuthenticationGuard.name);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.UNAUTHORIZED);
    }
  }
}

export default AuthenticationGuard;
