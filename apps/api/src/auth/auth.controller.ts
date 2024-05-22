import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
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
  async checkTotp(@Body() auth: AuthType, @GetUsername() username: string) {
    try {
      await this.authService.checkTotp(auth, username);
      return { message: 'Totp is valid' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get(':username')
  getQrCode(@Param('username') username: string) {
    return this.authService.getQrCode(username);
  }
}

export default AuthController;
