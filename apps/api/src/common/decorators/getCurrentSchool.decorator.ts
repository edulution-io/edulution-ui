import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

const GetCurrentSchool = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request: Request = ctx.switchToHttp().getRequest();
  if (!request.user?.school) {
    throw new UnauthorizedException('school in JWT is missing');
  }
  return request.user.school;
});

export default GetCurrentSchool;
