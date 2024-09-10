import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SigninRequest } from 'oidc-client-ts';
import { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import AuthService from './auth.service';

@ApiBearerAuth()
@Controller('auth')
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('/.well-known/openid-configuration')
  authconfig(@Req() req: Request) {
    return this.authService.authconfig(req);
  }

  @Public()
  @Post()
  authenticate(@Body() body: SigninRequest) {
    return this.authService.authenticateUser(body);
  }
}

export default AuthController;
