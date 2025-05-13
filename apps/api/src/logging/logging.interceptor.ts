/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';

const logLevel = process.env.EDUI_LOG_LEVEL;

@Injectable()
class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const { method, url, params, query } = req;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const { statusCode } = res;
        const contentLength = res.getHeader('content-length') ?? '-';
        const contextClassName = context.getClass().name;
        const contextHandlerName = context.getHandler().name;

        switch (logLevel) {
          case 'debug':
            Logger.debug(`${statusCode} ${duration}ms ${contextClassName}.${contextHandlerName} ${method} ${url}`);
            break;
          case 'verbose':
            Logger.verbose(
              JSON.stringify({
                method,
                url,
                params,
                query,
                ip,
                userAgent,
                statusCode,
                contentLength,
                duration,
                handler: `${contextClassName}.${contextHandlerName}`,
              }),
              LoggingInterceptor.name,
            );
            break;
          default:
            break;
        }
      }),
      catchError((err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err));

        switch (logLevel) {
          case 'debug':
            Logger.error(
              JSON.stringify({
                method,
                url,
                params,
                query,
                ip,
                message: error.message,
                stack: error.stack,
              }),
              error.stack,
              'LoggingInterceptorError',
            );
            break;
          case 'warn':
            Logger.error(
              JSON.stringify({
                method,
                url,
                params,
                query,
                ip,
                message: error.message,
              }),
              undefined,
              'LoggingInterceptorError',
            );
            break;
          default:
            break;
        }

        return throwError(() => err);
      }),
    );
  }
}

export default LoggingInterceptor;
