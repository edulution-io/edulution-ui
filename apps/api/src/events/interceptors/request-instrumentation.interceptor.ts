/*
 * LICENSE PLACEHOLDER
 */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';
import { randomUUID } from 'crypto';
import {
  EventBuilder,
  EVENT_SOURCES,
  HTTP_EVENT_TYPES,
  EVENT_SENSITIVITY,
} from '@edulution/events';
import EventsService from '../events.service';
import { SKIP_INSTRUMENTATION_KEY } from '../decorators/skip-instrumentation.decorator';

const CORRELATION_ID_HEADER = 'x-correlation-id';
const REQUEST_ID_HEADER = 'x-request-id';

declare module 'express' {
  interface Request {
    correlationId?: string;
    requestId?: string;
    eventContext?: {
      sessionId?: string;
      userId?: string;
    };
  }
}

@Injectable()
class RequestInstrumentationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestInstrumentationInterceptor.name);

  private readonly enabled: boolean;

  constructor(
    private readonly eventsService: EventsService,
    private readonly reflector: Reflector,
  ) {
    this.enabled = process.env.EVENTS_INSTRUMENTATION_ENABLED !== 'false';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.enabled || context.getType() !== 'http') {
      return next.handle();
    }

    const shouldSkip = this.reflector.getAllAndOverride<boolean>(SKIP_INSTRUMENTATION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (shouldSkip) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    if (req.path.includes('/sse') || req.headers.accept?.includes('text/event-stream')) {
      return next.handle();
    }

    if (req.path.includes('/events/')) {
      return next.handle();
    }

    const correlationId = (req.headers[CORRELATION_ID_HEADER] as string) || `corr-${randomUUID()}`;
    const requestId = (req.headers[REQUEST_ID_HEADER] as string) || randomUUID();

    req.correlationId = correlationId;
    req.requestId = requestId;

    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    res.setHeader(REQUEST_ID_HEADER, requestId);

    const startTime = Date.now();
    const occurredAt = new Date().toISOString();

    this.publishRequestStarted(req, context, correlationId, requestId, occurredAt);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.publishRequestCompleted(req, res, context, correlationId, requestId, duration, occurredAt);
      }),
      catchError((err: unknown) => {
        const duration = Date.now() - startTime;
        this.publishRequestFailed(req, res, context, correlationId, requestId, duration, occurredAt, err);
        return throwError(() => err);
      }),
    );
  }

  private getUserId(req: Request): string {
    const {user} = (req as Request & { user?: { username?: string; sub?: string } });
    return user?.username || user?.sub || 'anonymous';
  }

  private getHandlerName(context: ExecutionContext): string {
    return `${context.getClass().name}.${context.getHandler().name}`;
  }

  private publishRequestStarted(
    req: Request,
    context: ExecutionContext,
    correlationId: string,
    requestId: string,
    occurredAt: string,
  ): void {
    if (!this.eventsService.isReady()) {
      return;
    }

    try {
      const event = EventBuilder.create()
        .withUserId(this.getUserId(req))
        .withSource(EVENT_SOURCES.HTTP)
        .withType(HTTP_EVENT_TYPES.REQUEST_STARTED)
        .withOccurredAt(occurredAt)
        .withObject({
          object_type: 'http_request',
          object_id: requestId,
          object_ref: `${req.method} ${req.path}`,
        })
        .withCorrelationId(correlationId)
        .withRequestId(requestId)
        .withSessionId(req.eventContext?.sessionId || '')
        .withSensitivity(EVENT_SENSITIVITY.LOW)
        .addMetadata('method', req.method)
        .addMetadata('path', req.path)
        .addMetadata('handler', this.getHandlerName(context))
        .addMetadata('user_agent', req.headers['user-agent'] || '')
        .addMetadata('ip', this.getClientIp(req))
        .build();

      this.eventsService.publish(event).catch((err) => {
        this.logger.warn(`Failed to publish request.started event: ${err.message}`);
      });
    } catch (error) {
      this.logger.warn(`Failed to build request.started event: ${(error as Error).message}`);
    }
  }

  private publishRequestCompleted(
    req: Request,
    res: Response,
    context: ExecutionContext,
    correlationId: string,
    requestId: string,
    duration: number,
    startedAt: string,
  ): void {
    if (!this.eventsService.isReady()) {
      return;
    }

    try {
      const event = EventBuilder.create()
        .withUserId(this.getUserId(req))
        .withSource(EVENT_SOURCES.HTTP)
        .withType(HTTP_EVENT_TYPES.REQUEST_COMPLETED)
        .withObject({
          object_type: 'http_request',
          object_id: requestId,
          object_ref: `${req.method} ${req.path}`,
        })
        .withCorrelationId(correlationId)
        .withRequestId(requestId)
        .withSessionId(req.eventContext?.sessionId || '')
        .withSensitivity(EVENT_SENSITIVITY.LOW)
        .addMetadata('method', req.method)
        .addMetadata('path', req.path)
        .addMetadata('handler', this.getHandlerName(context))
        .addMetadata('status_code', res.statusCode)
        .addMetadata('duration_ms', duration)
        .addMetadata('started_at', startedAt)
        .build();

      this.eventsService.publish(event).catch((err) => {
        this.logger.warn(`Failed to publish request.completed event: ${err.message}`);
      });
    } catch (error) {
      this.logger.warn(`Failed to build request.completed event: ${(error as Error).message}`);
    }
  }

  private publishRequestFailed(
    req: Request,
    _res: Response,
    context: ExecutionContext,
    correlationId: string,
    requestId: string,
    duration: number,
    startedAt: string,
    error: unknown,
  ): void {
    if (!this.eventsService.isReady()) {
      return;
    }

    try {
      const err = error instanceof Error ? error : new Error(String(error));
      const statusCode = this.getErrorStatusCode(error);

      const event = EventBuilder.create()
        .withUserId(this.getUserId(req))
        .withSource(EVENT_SOURCES.HTTP)
        .withType(HTTP_EVENT_TYPES.REQUEST_FAILED)
        .withObject({
          object_type: 'http_request',
          object_id: requestId,
          object_ref: `${req.method} ${req.path}`,
        })
        .withCorrelationId(correlationId)
        .withRequestId(requestId)
        .withSessionId(req.eventContext?.sessionId || '')
        .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
        .addMetadata('method', req.method)
        .addMetadata('path', req.path)
        .addMetadata('handler', this.getHandlerName(context))
        .addMetadata('status_code', statusCode)
        .addMetadata('duration_ms', duration)
        .addMetadata('started_at', startedAt)
        .addMetadata('error_name', err.name)
        .addMetadata('error_message', err.message.substring(0, 500))
        .build();

      this.eventsService.publish(event).catch((publishErr) => {
        this.logger.warn(`Failed to publish request.failed event: ${publishErr.message}`);
      });
    } catch (buildError) {
      this.logger.warn(`Failed to build request.failed event: ${(buildError as Error).message}`);
    }
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || 'unknown';
  }

  private getErrorStatusCode(error: unknown): number {
    if (error && typeof error === 'object' && 'getStatus' in error && typeof error.getStatus === 'function') {
      return error.getStatus() as number;
    }
    return 500;
  }
}

export default RequestInstrumentationInterceptor;
