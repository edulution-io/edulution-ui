import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import LoggerEnum from '../types/logger';

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
      await this.jwtService.verifyAsync(token, {
        secret: Buffer.from(`${process.env.KEYCLOAK_AUTH_CLIENT_SECRET}`, 'base64'),
      });

      return true;
    } catch (e) {
      Logger.warn(e, LoggerEnum.AUTH);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.UNAUTHORIZED);
    }
  }
}

export default AuthenticationGuard;
