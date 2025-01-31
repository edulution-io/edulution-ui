import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

const GetUsersEmailAddress = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request: Request = ctx.switchToHttp().getRequest();
  if (!request.user?.email) {
    throw new UnauthorizedException('Email in JWT is missing');
  }
  return request.user.email;
});

export default GetUsersEmailAddress;
