import { Injectable, Logger } from '@nestjs/common';
import * as OTPAuth from 'otpauth';
import LoggerEnum from '../types/logger';

type AuthType = {
  totpToken: string;
};
@Injectable()
class AuthService {
  checkTotp(auth: AuthType, username: string) {
    const token = auth.totpToken;
    const totp = new OTPAuth.TOTP({
      issuer: 'edulution-ui',
      label: username,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: process.env.EDUI_TOTP_SECRET as string,
    });

    const isTotpValid = totp.validate({ token }) !== null;
    const message = isTotpValid ? 'TOTP token is valid' : 'TOTP token is invalid';

    Logger.log(message, LoggerEnum.AUTH);

    return isTotpValid;
  }
}

export default AuthService;
