import { readFileSync } from 'fs';
import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import CustomHttpException from '@libs/error/CustomHttpException';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import PUBLIC_KEY_FILE_PATH from '@libs/common/constants/pubKeyFilePath';
import JWTUser from '@libs/user/types/jwt/jwtUser';

@Injectable()
class WsAuthenticationGuard implements CanActivate {
  private readonly pubKey: string;

  constructor(private jwtService: JwtService) {
    this.pubKey = readFileSync(PUBLIC_KEY_FILE_PATH, 'utf8');
  }

  private extractTokenFromHandshake(client: any): string {
    if (client.handshake?.query && client.handshake.query.token) {
      return client.handshake.query.token.toString();
    }

    const authHeader = client.handshake?.headers?.authorization || client.handshake?.headers?.Authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer') {
        return token;
      }
    }
    return '';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = this.extractTokenFromHandshake(client);
    if (!token) {
      throw new CustomHttpException(
        AuthErrorMessages.TokenExpired,
        HttpStatus.UNAUTHORIZED,
        new Error('Missing token'),
        WsAuthenticationGuard.name,
      );
    }

    try {
      client.user = await this.jwtService.verifyAsync<JWTUser>(token, {
        publicKey: this.pubKey,
        algorithms: ['RS256'],
      });
      client.token = token;
      return true;
    } catch (error) {
      throw new CustomHttpException(
        AuthErrorMessages.TokenExpired,
        HttpStatus.UNAUTHORIZED,
        error,
        WsAuthenticationGuard.name,
      );
    }
  }
}

export default WsAuthenticationGuard;
