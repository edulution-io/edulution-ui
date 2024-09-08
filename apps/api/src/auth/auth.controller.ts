import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type SigninRequest from '@libs/auth/types/signin-request';
import { Public } from '../common/decorators/public.decorator';
import AuthService from './auth.service';

@ApiBearerAuth()
@Controller('auth')
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('/.well-known/openid-configuration')
  authconfig() {
    return this.authService.authconfig();
  }

  @Public()
  @Post()
  authenticate(@Body() body: SigninRequest) {
    return this.authService.authenticateUser(body);
  }
}

export default AuthController;
