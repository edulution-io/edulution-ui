/*
 * LICENSE PLACEHOLDER
 */

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

const EVENTS_API_KEY_HEADER = 'x-events-api-key';

@Injectable()
class EventsApiKeyGuard implements CanActivate {
  private readonly apiKeys: Set<string>;

  constructor() {
    const keysEnv = process.env.EVENTS_API_KEYS || '';
    this.apiKeys = new Set(keysEnv.split(',').map((k) => k.trim()).filter(Boolean));

    if (this.apiKeys.size === 0 && process.env.NODE_ENV === 'development') {
      this.apiKeys.add('dev-events-key');
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers[EVENTS_API_KEY_HEADER] as string | undefined;

    if (!apiKey) {
      throw new UnauthorizedException('Missing API key header');
    }

    if (!this.apiKeys.has(apiKey)) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}

export default EventsApiKeyGuard;
