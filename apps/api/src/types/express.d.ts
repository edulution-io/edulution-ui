import 'express';

import JWTUser from '@libs/user/types/jwt/jwtUser';

declare module 'express' {
  interface Request {
    user?: JWTUser;
    token?: string;
  }
}
