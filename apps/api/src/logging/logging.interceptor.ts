/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
            error,
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
