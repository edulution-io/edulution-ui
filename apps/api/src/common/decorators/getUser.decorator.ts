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

export const GetCurrentUsername = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request: Request = ctx.switchToHttp().getRequest();
  if (!request.user?.preferred_username) {
    throw new UnauthorizedException('preferred_username in JWT is missing');
  }
  return request.user.preferred_username;
});

export const GetCurrentUserGroups = createParamDecorator((_data: unknown, ctx: ExecutionContext): string[] => {
  const request: Request = ctx.switchToHttp().getRequest();
  if (!request.user?.ldapGroups) {
    throw new UnauthorizedException('ldapGroups in JWT is missing');
  }
  return request.user.ldapGroups;
});

export default GetCurrentUser;
