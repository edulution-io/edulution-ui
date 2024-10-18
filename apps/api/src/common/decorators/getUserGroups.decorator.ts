import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

const GetCurrentUserGroups = createParamDecorator((_data: unknown, ctx: ExecutionContext): string[] => {
  const request: Request = ctx.switchToHttp().getRequest();
  if (!request.user?.ldapGroups) {
    throw new UnauthorizedException('ldapGroups in JWT is missing');
  }
  return request.user.ldapGroups;
});

export default GetCurrentUserGroups;
