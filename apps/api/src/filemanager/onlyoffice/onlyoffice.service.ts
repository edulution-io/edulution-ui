import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
@Injectable()
class OnlyofficeService {
  constructor() {}

  async getOnlyofficeToken(token: string, payload: string) {
    if (!token) return '';
    const secret = 'u1yJ8zke1qyGwQPjEjOWSUNC89FFWcSZ';
    return jwt.sign(payload, secret, { noTimestamp: true });
  }
}

export default OnlyofficeService;
