import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { Request } from 'express';
import { AuthenticationService } from './auth.service';
import LoggerEnum from '../types/logger';

interface AuthenticatedRequest extends Request {
  user: any; // Hier sollte der tatsächliche Typ des Benutzers stehen
}

@Injectable()
class AuthenticationGuard implements CanActivate {
  constructor(private readonly authenticationService: AuthenticationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();

    const header = request.header('Authorization');
    if (!header) {
      Logger.log('Authorization: Bearer <token> header missing', LoggerEnum.AUTH);
      throw new HttpException('Authorization: Bearer <token> header missing', HttpStatus.UNAUTHORIZED);
    }

    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      Logger.log('Authorization: Bearer <token> header invalid', LoggerEnum.AUTH);
      throw new HttpException('Authorization: Bearer <token> header invalid', HttpStatus.UNAUTHORIZED);
    }

    const token = parts[1];

    try {
      // Store the user on the request object if we want to retrieve it from the controllers
      request.user = await this.authenticationService.authenticate(token);
      return true;
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      throw new HttpException(e.message, HttpStatus.UNAUTHORIZED);
    }
  }
}

export default AuthenticationGuard;
