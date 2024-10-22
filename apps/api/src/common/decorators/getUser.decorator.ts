import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import JWTUser from '../../types/JWTUser';

const GetCurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): JWTUser => {
  const request: Request = ctx.switchToHttp().getRequest();
  if (!request.user) {
    throw new UnauthorizedException('JWT is missing');
  }
  return request.user;
});

export default GetCurrentUser;
