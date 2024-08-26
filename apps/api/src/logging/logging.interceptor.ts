import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() === 'http') {
      return this.logHttpCall(context, next);
    }
    return next.handle();
  }

  private logHttpCall(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, path: url } = request;

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();

        const { statusCode } = response;

        this.logger.log(
          `${statusCode} ${Date.now() - now}ms ${context.getClass().name}.${context.getHandler().name} ${method} ${url}`,
        );
      }),
    );
  }
}
export default LoggingInterceptor;
