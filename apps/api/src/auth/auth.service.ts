import { Injectable, Logger } from '@nestjs/common';
import * as OTPAuth from 'otpauth';
import UsersService from '../users/users.service';
import LoggerEnum from '../types/logger';

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
    const message = isTotpValid ? 'TOTP token is valid' : 'TOTP token is invalid';

    const newUser = await this.usersService.update(username, {
      isTotpSet: true,
    });

    Logger.log(newUser, LoggerEnum.EDULUTIONAPI);
    Logger.log(message, LoggerEnum.AUTH);

    return isTotpValid;
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
