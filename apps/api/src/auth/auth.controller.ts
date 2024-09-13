import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SigninRequest } from 'oidc-client-ts';
import { Request } from 'express';
import AUTH_PATHS from '@libs/auth/constants/auth-endpoints';
import { Public } from '../common/decorators/public.decorator';
import AuthService from './auth.service';

@ApiTags(AUTH_PATHS.AUTH_ENDPOINT)
@ApiBearerAuth()
@Controller(AUTH_PATHS.AUTH_ENDPOINT)
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get(AUTH_PATHS.AUTH_OIDC_CONFIG_PATH)
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
