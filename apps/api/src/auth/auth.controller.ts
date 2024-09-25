import { Body, Controller, Get, Logger, Param, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProcessResourceOwnerPasswordCredentialsArgs } from 'oidc-client-ts';
import { Request } from 'express';
import AUTH_PATHS from '@libs/auth/constants/auth-endpoints';
import { Public } from '../common/decorators/public.decorator';
import AuthService from './auth.service';

@ApiTags(AUTH_PATHS.AUTH_ENDPOINT)
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
  authenticate(@Body() body: ProcessResourceOwnerPasswordCredentialsArgs) {
    return this.authService.authenticateUser(body);
  }

  @Get(`${AUTH_PATHS.AUTH_QRCODE}/:username`)
  getQrCode(@Param('username') username: string) {
    Logger.log(username, AuthController.name);
    return this.authService.getQrCode(username);
  }
}

export default AuthController;
