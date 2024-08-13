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

  async getCurrentUsername(token: string): Promise<string> {
    const user = await this.getCurrentUser(token);
    if (!user.preferred_username) {
      throw new UnauthorizedException('preferred_username in JWT is missing');
    }
    return user.preferred_username;
  }

  async getCurrentUserGroups(token: string): Promise<string[]> {
    const user = await this.getCurrentUser(token);
    if (!user.ldapGroups) {
      throw new UnauthorizedException('ldapGroups in JWT is missing');
    }
    return user.ldapGroups;
  }
}

export default TokenService;
