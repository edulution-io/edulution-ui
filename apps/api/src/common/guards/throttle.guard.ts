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

import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { IRoute } from 'express';
import { Request, Response } from 'express';
import THROTTLE_METADATA_KEY from '@libs/common/constants/throttleMetadataKey';
import { THROTTLE_ERROR_MESSAGES } from '@libs/common/constants/throttleErrorMessages';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import CustomHttpException from '../CustomHttpException';
import type { ThrottleConfig } from '../decorators/throttle.decorator';

type ThrottleCacheEntry = {
  count: number;
  expiresAt: number;
};

const throttleCache = new Map<string, ThrottleCacheEntry>();
const MAX_CACHE_SIZE = 10_000;
const TARGET_SIZE_AFTER_CLEANUP = MAX_CACHE_SIZE * 0.9;

const evictExpiredEntries = () => {
  if (throttleCache.size < MAX_CACHE_SIZE) {
    return;
  }

  const now = Date.now();
  throttleCache.forEach((entry, key) => {
    if (entry.expiresAt <= now) {
      throttleCache.delete(key);
    }
  });

  if (throttleCache.size < MAX_CACHE_SIZE) {
    return;
  }

  const entries = Array.from(throttleCache.entries()).sort((a, b) => a[1].expiresAt - b[1].expiresAt);
  const entriesToRemove = entries.slice(0, throttleCache.size - TARGET_SIZE_AFTER_CLEANUP);
  entriesToRemove.forEach(([key]) => throttleCache.delete(key));
};

@Injectable()
class ThrottleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const config = this.reflector.getAllAndOverride<ThrottleConfig | undefined>(THROTTLE_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!config) {
      return true;
    }

    const http = context.switchToHttp();
    const request: Request = http.getRequest();
    const response: Response = http.getResponse();
    const username = request.user?.preferred_username;

    if (!username) {
      return true;
    }

    const routePath = `${request.method}:${(request.route as IRoute | undefined)?.path ?? request.path}`;
    const cacheKey = `${username}:${routePath}`;
    const now = Date.now();

    const cached = throttleCache.get(cacheKey);

    if (cached && cached.expiresAt > now) {
      if (cached.count >= config.limit) {
        const retryAfterSeconds = Math.ceil((cached.expiresAt - now) / 1000);

        response.setHeader(HTTP_HEADERS.XRateLimitLimit, config.limit);
        response.setHeader(HTTP_HEADERS.XRateLimitRemaining, 0);
        response.setHeader(HTTP_HEADERS.RetryAfter, retryAfterSeconds);

        throw new CustomHttpException(
          THROTTLE_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
          HttpStatus.TOO_MANY_REQUESTS,
          { username, routePath },
          ThrottleGuard.name,
        );
      }

      cached.count += 1;

      response.setHeader(HTTP_HEADERS.XRateLimitLimit, config.limit);
      response.setHeader(HTTP_HEADERS.XRateLimitRemaining, config.limit - cached.count);

      return true;
    }

    evictExpiredEntries();
    throttleCache.set(cacheKey, { count: 1, expiresAt: now + config.ttl });

    response.setHeader(HTTP_HEADERS.XRateLimitLimit, config.limit);
    response.setHeader(HTTP_HEADERS.XRateLimitRemaining, config.limit - 1);

    return true;
  }
}

export default ThrottleGuard;
