import 'express';
import JWTUser from './JWTUser';

declare module 'express' {
  interface Request {
    user?: JWTUser;
    token?: string;
  }
}
