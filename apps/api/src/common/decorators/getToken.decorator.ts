import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

const GetTokenDecorator = createParamDecorator((_data: unknown, ctx: ExecutionContext): string | undefined => {
  const request: Request = ctx.switchToHttp().getRequest();
  return request.token;
});

export default GetTokenDecorator;
