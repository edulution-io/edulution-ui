import { Injectable, UnauthorizedException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { JwtService } from '@nestjs/jwt';
import PUBLIC_KEY_FILE_PATH from '@libs/common/constants/pubKeyFilePath';

import JWTUser from '@libs/user/types/jwt/jwtUser';

@Injectable()
class TokenService {
  constructor(private jwtService: JwtService) {}

  async isTokenValid(token: string): Promise<boolean> {
    if (!token) {
      throw new UnauthorizedException('JWT or Token is missing');
    }

    const pubKey = readFileSync(PUBLIC_KEY_FILE_PATH, 'utf8');

    try {
      await this.jwtService.verifyAsync(token, {
        publicKey: pubKey,
        algorithms: ['RS256'],
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getCurrentUser(token: string): Promise<JWTUser> {
    if (token) {
      const pubKey = readFileSync(PUBLIC_KEY_FILE_PATH, 'utf8');
      try {
        const user: JWTUser = await this.jwtService.verifyAsync<JWTUser>(token, {
          publicKey: pubKey,
          algorithms: ['RS256'],
        });
        if (!user) {
          throw new UnauthorizedException('User not found in JWT');
        }
        return user;
      } catch (error) {
        throw new UnauthorizedException('Invalid or expired token');
      }
    } else {
      throw new UnauthorizedException('JWT or Token is missing');
    }
  }
}

export default TokenService;
