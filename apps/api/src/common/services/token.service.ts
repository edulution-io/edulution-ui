import { Injectable, UnauthorizedException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { JwtService } from '@nestjs/jwt';
import JWTUser from '../../types/JWTUser';

@Injectable()
class TokenService {
  constructor(private jwtService: JwtService) {}

  async isTokenValid(token: string): Promise<boolean> {
    if (!token) {
      throw new UnauthorizedException('JWT or Token is missing');
    }

    const pubKeyPath = process.env.PUBLIC_KEY_FILE_PATH as string;
    const pubKey = readFileSync(pubKeyPath, 'utf8');

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
      const pubKeyPath = process.env.PUBLIC_KEY_FILE_PATH as string;
      const pubKey = readFileSync(pubKeyPath, 'utf8');
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