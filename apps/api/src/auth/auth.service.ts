import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as OTPAuth from 'otpauth';
import UsersService from '../users/users.service';

type AuthType = {
  totpToken: string;
};

const totpConfig = {
  issuer: 'edulution-ui',
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
};

const totpSecret = process.env.EDUI_TOTP_SECRET as string;

@Injectable()
class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async checkTotp(auth: AuthType, username: string): Promise<boolean> {
    const token = auth.totpToken;

    // TODO: Generate user specific secret NIEDUUI-141
    const secret = `${totpSecret}${username.replace(/-/g, '')}`;
    const newTotp = new OTPAuth.TOTP({ ...totpConfig, label: username, secret });

    const isTotpValid = newTotp.validate({ token }) !== null;

    if (isTotpValid) {
      Logger.log(`Totp is valid`, AuthService.name);
      try {
        await this.usersService.update(username, {
          isTotpSet: true,
        });
        throw new HttpException('Totp is valid', HttpStatus.OK);
      } catch (e) {
        return false;
      }
    } else {
      throw new HttpException('Totp is invalid', HttpStatus.UNAUTHORIZED);
    }
  }

  getQrCode(username: string): string {
    // TODO: Move secret to DB NIEDUUI-141
    const secret = `${totpSecret}${username.replace(/-/g, '')}`;
    const newTotp = new OTPAuth.TOTP({ ...totpConfig, label: username, secret });
    const totpString = newTotp.toString();
    return totpString;
  }
}

export default AuthService;
