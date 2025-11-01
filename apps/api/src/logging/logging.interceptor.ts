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

import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import LOG_LEVELS from './log-levels';

const logLevel = process.env.EDUI_LOG_LEVEL;

@Injectable()
class LoggingInterceptor implements NestInterceptor {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    if (req.path.includes('/sse') || req.headers.accept?.includes('text/event-stream')) {
      return next.handle();
    }

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        LoggingInterceptor.logSuccess(context, res, req, duration);
      }),
      catchError((err: unknown) => {
        LoggingInterceptor.logError(err, req);
        return throwError(() => err);
      }),
    );
  }

  private static isAuthEndpointUnauthorized(err: unknown, path: string): boolean {
    return (
      err instanceof HttpException &&
      err.getStatus() === Number(HttpStatus.UNAUTHORIZED) &&
      path.includes('/auth') &&
      !path.includes('/auth/')
    );
  }

  private static logSuccess(context: ExecutionContext, res: Response, req: Request, duration: number): void {
    if (!logLevel || logLevel === LOG_LEVELS.WARN) {
      return;
    }

    const { method, path, params, query } = req;
    const { statusCode } = res;

    if (logLevel === LOG_LEVELS.DEBUG) {
      const contextClassName = context.getClass().name;
      const contextHandlerName = context.getHandler().name;
      Logger.debug(`${statusCode} ${duration}ms ${contextClassName}.${contextHandlerName} ${method} ${path}`);
      return;
    }

    if (logLevel === LOG_LEVELS.VERBOSE) {
      const ip = req.headers[HTTP_HEADERS.XForwaredFor] || req.socket.remoteAddress;
      const userAgent = req.headers[HTTP_HEADERS.UserAgent];
      const contentLength = res.getHeader(HTTP_HEADERS.ContentLength) ?? '-';
      const contextClassName = context.getClass().name;
      const contextHandlerName = context.getHandler().name;

      Logger.verbose(
        JSON.stringify({
          method,
          path,
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
    }
  }

  private static logError(err: unknown, req: Request): void {
    const { method, url, params, query, path } = req;
    const error = err instanceof Error ? err : new Error(String(err));
    const ip = req.headers[HTTP_HEADERS.XForwaredFor] || req.socket.remoteAddress;

    if (LoggingInterceptor.isAuthEndpointUnauthorized(err, path)) {
      if (logLevel === LOG_LEVELS.DEBUG || logLevel === LOG_LEVELS.VERBOSE) {
        Logger.debug(
          JSON.stringify({
            method,
            url,
            message: error.message,
          }),
          LoggingInterceptor.name,
        );
      }
      return;
    }

    if (!logLevel || logLevel === LOG_LEVELS.WARN) {
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
        LoggingInterceptor.name,
      );
      return;
    }

    if (logLevel === LOG_LEVELS.DEBUG || logLevel === LOG_LEVELS.VERBOSE) {
      Logger.error(
        JSON.stringify({
          method,
          url,
          params,
          query,
          ip,
          message: error.message,
        }),
        error.stack,
        LoggingInterceptor.name,
      );
    }
  }
}

export default LoggingInterceptor;
