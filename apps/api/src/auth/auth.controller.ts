import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProcessResourceOwnerPasswordCredentialsArgs } from 'oidc-client-ts';
import { Request } from 'express';
import AUTH_PATHS from '@libs/auth/constants/auth-endpoints';
import { Public } from '../common/decorators/public.decorator';
import AuthService from './auth.service';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';

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

  @Get(AUTH_PATHS.AUTH_QRCODE)
  getQrCode(@GetCurrentUsername() username: string) {
    return this.authService.getQrCode(username);
  }

  @Post(AUTH_PATHS.AUTH_CHECK_TOTP)
  setupTotp(@GetCurrentUsername() username: string, @Body() body: { totp: string; secret: string }) {
    return this.authService.setupTotp(username, body);
  }
}

export default AuthController;
