import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import JWTUser from '../../types/JWTUser';

const GetUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): JWTUser | undefined => {
  const request: Request = ctx.switchToHttp().getRequest();
  return request.user;
});

export const GetUsername = createParamDecorator((_data: unknown, ctx: ExecutionContext): string | undefined => {
  const request: Request = ctx.switchToHttp().getRequest();
  return request.user?.preferred_username;
});

export default GetUser;
