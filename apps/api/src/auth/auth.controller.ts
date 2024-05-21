import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import AuthService from './auth.service';
import { GetUsername } from '../common/decorators/getUser.decorator';

type AuthType = {
  totpToken: string;
};
@ApiBearerAuth()
@Controller('auth')
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  checkTotp(@Body() auth: AuthType, @GetUsername() username: string) {
    const isTotpValid = this.authService.checkTotp(auth, username);
    return isTotpValid;
  }

  @Get(':username')
  getQrCode(@Param('username') username: string) {
    return this.authService.getQrCode(username);
  }
}

export default AuthController;
