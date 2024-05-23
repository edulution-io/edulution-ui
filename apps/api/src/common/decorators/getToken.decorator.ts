import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

const GetToken = createParamDecorator((_data: unknown, ctx: ExecutionContext): string | undefined => {
  const request: Request = ctx.switchToHttp().getRequest();
  return request.token;
});

export default GetToken;
