import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
class OnlyofficeService {
  constructor() {}

  async getOnlyofficeToken(token: string, payload: string) {
    if (!token) return '';
    const secret = process.env.EDUI_ONLYOFFICE_SECRET as string;
    return jwt.sign(payload, secret, { noTimestamp: true });
  }
}

export default OnlyofficeService;
