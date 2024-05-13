import * as fs from 'fs';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import LoggerEnum from '../types/logger';
import JWTUser from '../types/JWTUser';

@Injectable()
class AuthenticationGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  private static extractTokenFromHeader(request: Request): string {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : '';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
      Logger.warn(e, LoggerEnum.AUTH);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.UNAUTHORIZED);
    }
  }
}

export default AuthenticationGuard;
