import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import LoggerEnum from '../types/logger';

interface AuthenticatedRequest extends Request {
  user: any;
}

interface TokenPayloadType {
  exp: number;
  iat: number;
  jti: string;
  iss: string;
  sub: string;
  typ: string;
  azp: string;
  session_state: string;
  scope: string;
  sid: string;
  ldapGroups: string[];
}

@Injectable()
class AuthenticationGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  private static extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const token = AuthenticationGuard.extractTokenFromHeader(request) as string;

    try {
      const payload: TokenPayloadType = await this.jwtService.verifyAsync(token, {
        secret: Buffer.from(`${process.env.KEYCLOAK_AUTH_CLIENT_SECRET}`, 'base64'),
      });
      request.user = payload;

      return true;
    } catch (e) {
      Logger.log(e, LoggerEnum.AUTH);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.UNAUTHORIZED);
    }
  }
}

export default AuthenticationGuard;
