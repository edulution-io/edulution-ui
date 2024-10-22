import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import AUTH_PATHS from '@libs/auth/constants/auth-endpoints';
import AuthRequestArgs from '@libs/auth/types/auth-request';
import { Public } from '../common/decorators/public.decorator';
import AuthService from './auth.service';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';

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
  authenticate(@Body() body: AuthRequestArgs) {
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

  @Public()
  @Get(`${AUTH_PATHS.AUTH_CHECK_TOTP}/:username`)
  getTotpInfo(@Param() params: { username: string }) {
    return this.authService.getTotpInfo(params.username);
  }

  @Put(AUTH_PATHS.AUTH_CHECK_TOTP)
  disableTotp(@GetCurrentUsername() username: string) {
    return this.authService.disableTotp(username);
  }
}

export default AuthController;
