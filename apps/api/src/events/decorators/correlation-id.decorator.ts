/*
 * LICENSE PLACEHOLDER
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

const CorrelationId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string | undefined => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.correlationId;
});

export default CorrelationId;
