import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';

@Injectable()
class RateLimiterInterceptor implements NestInterceptor {
  private readonly requests: Map<string, { count: number; firstRequestTime: number }> = new Map();

  private readonly MAX_REQUESTS = 10;

  private readonly WINDOW_TIME_MS = 10_000; // 10 seconds

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    let key = '';

    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      key = request.ip;
    } else if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient<Socket>();
      key = client.handshake?.address || client.id;
    } else {
      return next.handle();
    }

    let record = this.requests.get(key);

    if (!record) {
      record = { count: 0, firstRequestTime: now };
      this.requests.set(key, record);
    }

    if (now - record.firstRequestTime > this.WINDOW_TIME_MS) {
      record.count = 0;
      record.firstRequestTime = now;
    }

    record.count++;

    if (record.count > this.MAX_REQUESTS) {
      throw new CustomHttpException(CommonErrorMessages.RATE_LIMIT_EXCEEDED, HttpStatus.TOO_MANY_REQUESTS);
    }

    return next.handle();
  }
}

export default RateLimiterInterceptor;
