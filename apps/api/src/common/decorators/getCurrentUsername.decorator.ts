import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

const GetCurrentUsername = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request: Request = ctx.switchToHttp().getRequest();
  if (!request.user?.preferred_username) {
    throw new UnauthorizedException('preferred_username in JWT is missing');
  }
  return request.user.preferred_username;
});

export default GetCurrentUsername;
