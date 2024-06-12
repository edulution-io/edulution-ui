import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import JWTUser from '../../types/JWTUser';

const GetCurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): Partial<JWTUser> => {
  const request: Request = ctx.switchToHttp().getRequest();
  return request.user || {};
});

export const GetCurrentUsername = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request: Request = ctx.switchToHttp().getRequest();
  return request.user?.preferred_username || '';
});

export default GetCurrentUser;
