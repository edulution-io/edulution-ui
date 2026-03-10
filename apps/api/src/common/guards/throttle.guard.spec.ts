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

import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { THROTTLE_ERROR_MESSAGES } from '@libs/common/constants/throttleErrorMessages';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import THROTTLE_METADATA_KEY from '@libs/common/constants/throttleMetadataKey';
import type { ThrottleConfig } from '../decorators/throttle.decorator';
import CustomHttpException from '../CustomHttpException';
import ThrottleGuard from './throttle.guard';

const DEFAULT_CONFIG: ThrottleConfig = { limit: 3, ttl: 10_000 };

const createMockContext = (
  overrides: {
    username?: string;
    method?: string;
    routePath?: string;
    path?: string;
  } = {},
) => {
  const mockResponse = { setHeader: jest.fn() };
  const mockRequest = {
    user: overrides.username ? { preferred_username: overrides.username } : undefined,
    method: overrides.method ?? 'POST',
    route: overrides.routePath ? { path: overrides.routePath } : undefined,
    path: overrides.path ?? '/api/test',
  };

  const mockHandler = jest.fn();
  const mockClass = jest.fn();

  const context = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
      getResponse: () => mockResponse,
    }),
    getHandler: () => mockHandler,
    getClass: () => mockClass,
  } as unknown as ExecutionContext;

  return { context, mockResponse, mockRequest, mockHandler, mockClass };
};

describe(ThrottleGuard.name, () => {
  let guard: ThrottleGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new ThrottleGuard(reflector);
    jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when no throttle config is set', () => {
    it('should allow the request', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const { context } = createMockContext({ username: 'testuser' });

      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('when user is not authenticated', () => {
    it('should allow the request without username', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(DEFAULT_CONFIG);
      const { context } = createMockContext();

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow the request when user object is undefined', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(DEFAULT_CONFIG);
      const { context, mockRequest } = createMockContext();
      mockRequest.user = undefined;

      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('when user is authenticated and config is set', () => {
    it('should allow the first request and set rate limit headers', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(DEFAULT_CONFIG);
      const { context, mockResponse } = createMockContext({ username: 'user-first' });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(HTTP_HEADERS.XRateLimitLimit, DEFAULT_CONFIG.limit);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(HTTP_HEADERS.XRateLimitRemaining, DEFAULT_CONFIG.limit - 1);
    });

    it('should create a cache entry with count 1', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(DEFAULT_CONFIG);
      const { context } = createMockContext({
        username: 'user-cache-entry',
        method: 'GET',
        routePath: '/api/cache-test',
      });

      guard.canActivate(context);

      const { context: context2, mockResponse: mockResponse2 } = createMockContext({
        username: 'user-cache-entry',
        method: 'GET',
        routePath: '/api/cache-test',
      });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(DEFAULT_CONFIG);

      guard.canActivate(context2);

      expect(mockResponse2.setHeader).toHaveBeenCalledWith(HTTP_HEADERS.XRateLimitRemaining, DEFAULT_CONFIG.limit - 2);
    });

    it('should decrement remaining correctly on subsequent requests within ttl', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(DEFAULT_CONFIG);

      const makeRequest = () => {
        const { context, mockResponse } = createMockContext({
          username: 'user-increment',
          method: 'POST',
          routePath: '/api/increment',
        });
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(DEFAULT_CONFIG);
        guard.canActivate(context);
        return mockResponse;
      };

      makeRequest();
      const secondResponse = makeRequest();
      const thirdResponse = makeRequest();

      expect(secondResponse.setHeader).toHaveBeenCalledWith(HTTP_HEADERS.XRateLimitRemaining, 1);
      expect(thirdResponse.setHeader).toHaveBeenCalledWith(HTTP_HEADERS.XRateLimitRemaining, 0);
    });

    it('should throw TOO_MANY_REQUESTS when limit is exceeded', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(DEFAULT_CONFIG);

      const makeRequest = () => {
        const { context } = createMockContext({
          username: 'user-exceed',
          method: 'POST',
          routePath: '/api/exceed',
        });
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(DEFAULT_CONFIG);
        return guard.canActivate(context);
      };

      makeRequest();
      makeRequest();
      makeRequest();

      expect(() => makeRequest()).toThrow(CustomHttpException);
      try {
        makeRequest();
      } catch (error) {
        expect((error as CustomHttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        expect((error as CustomHttpException).message).toBe(THROTTLE_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);
      }
    });

    it('should set Retry-After header only when rate limited', () => {
      const config: ThrottleConfig = { limit: 1, ttl: 10_000 };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      const { context, mockResponse } = createMockContext({
        username: 'user-retry',
        method: 'POST',
        routePath: '/api/retry',
      });
      guard.canActivate(context);

      expect(mockResponse.setHeader).not.toHaveBeenCalledWith(HTTP_HEADERS.RetryAfter, expect.anything());

      jest.spyOn(Date, 'now').mockReturnValue(1_003_000);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      const { context: context2, mockResponse: mockResponse2 } = createMockContext({
        username: 'user-retry',
        method: 'POST',
        routePath: '/api/retry',
      });

      expect(() => guard.canActivate(context2)).toThrow(CustomHttpException);
      expect(mockResponse2.setHeader).toHaveBeenCalledWith(HTTP_HEADERS.RetryAfter, 7);
    });

    it('should set remaining to 0 when count equals limit', () => {
      const config: ThrottleConfig = { limit: 1, ttl: 10_000 };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      const { context } = createMockContext({
        username: 'user-zero-remaining',
        method: 'POST',
        routePath: '/api/zero',
      });
      guard.canActivate(context);

      const { context: context2, mockResponse: mockResponse2 } = createMockContext({
        username: 'user-zero-remaining',
        method: 'POST',
        routePath: '/api/zero',
      });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      expect(() => guard.canActivate(context2)).toThrow(CustomHttpException);
      expect(mockResponse2.setHeader).toHaveBeenCalledWith(HTTP_HEADERS.XRateLimitRemaining, 0);
    });
  });

  describe('ttl expiration', () => {
    it('should reset count after ttl expires', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(DEFAULT_CONFIG);

      const { context } = createMockContext({
        username: 'user-ttl',
        method: 'POST',
        routePath: '/api/ttl',
      });
      guard.canActivate(context);

      jest.spyOn(Date, 'now').mockReturnValue(1_000_000 + DEFAULT_CONFIG.ttl + 1);

      const { context: context2, mockResponse: mockResponse2 } = createMockContext({
        username: 'user-ttl',
        method: 'POST',
        routePath: '/api/ttl',
      });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(DEFAULT_CONFIG);

      const result = guard.canActivate(context2);

      expect(result).toBe(true);
      expect(mockResponse2.setHeader).toHaveBeenCalledWith(HTTP_HEADERS.XRateLimitRemaining, DEFAULT_CONFIG.limit - 1);
    });

    it('should allow requests again after being rate limited and ttl expires', () => {
      const config: ThrottleConfig = { limit: 1, ttl: 5_000 };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      const { context } = createMockContext({
        username: 'user-recover',
        method: 'POST',
        routePath: '/api/recover',
      });
      guard.canActivate(context);

      const { context: context2 } = createMockContext({
        username: 'user-recover',
        method: 'POST',
        routePath: '/api/recover',
      });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);
      expect(() => guard.canActivate(context2)).toThrow(CustomHttpException);

      jest.spyOn(Date, 'now').mockReturnValue(1_000_000 + config.ttl + 1);

      const { context: context3 } = createMockContext({
        username: 'user-recover',
        method: 'POST',
        routePath: '/api/recover',
      });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      expect(guard.canActivate(context3)).toBe(true);
    });
  });

  describe('cache key isolation', () => {
    it('should track different users independently', () => {
      const config: ThrottleConfig = { limit: 1, ttl: 10_000 };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      const { context: contextA } = createMockContext({
        username: 'user-a-isolation',
        method: 'POST',
        routePath: '/api/isolation',
      });
      guard.canActivate(contextA);

      const { context: contextB } = createMockContext({
        username: 'user-b-isolation',
        method: 'POST',
        routePath: '/api/isolation',
      });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      expect(guard.canActivate(contextB)).toBe(true);
    });

    it('should track different routes independently for the same user', () => {
      const config: ThrottleConfig = { limit: 1, ttl: 10_000 };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      const { context: context1 } = createMockContext({
        username: 'user-routes',
        method: 'POST',
        routePath: '/api/route-a',
      });
      guard.canActivate(context1);

      const { context: context2 } = createMockContext({
        username: 'user-routes',
        method: 'POST',
        routePath: '/api/route-b',
      });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      expect(guard.canActivate(context2)).toBe(true);
    });

    it('should track different HTTP methods independently', () => {
      const config: ThrottleConfig = { limit: 1, ttl: 10_000 };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      const { context: contextGet } = createMockContext({
        username: 'user-methods',
        method: 'GET',
        routePath: '/api/methods',
      });
      guard.canActivate(contextGet);

      const { context: contextPost } = createMockContext({
        username: 'user-methods',
        method: 'POST',
        routePath: '/api/methods',
      });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      expect(guard.canActivate(contextPost)).toBe(true);
    });

    it('should use request.path as fallback when route.path is undefined', () => {
      const config: ThrottleConfig = { limit: 1, ttl: 10_000 };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      const { context: context1 } = createMockContext({
        username: 'user-fallback',
        method: 'GET',
        path: '/api/fallback-path',
      });
      guard.canActivate(context1);

      const { context: context2 } = createMockContext({
        username: 'user-fallback',
        method: 'GET',
        path: '/api/fallback-path',
      });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      expect(() => guard.canActivate(context2)).toThrow(CustomHttpException);
    });
  });

  describe('edge cases', () => {
    it('should treat expiresAt === now as expired and reset the counter', () => {
      const config: ThrottleConfig = { limit: 2, ttl: 5_000 };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      const { context } = createMockContext({
        username: 'user-exact-boundary',
        method: 'POST',
        routePath: '/api/boundary',
      });
      guard.canActivate(context);

      jest.spyOn(Date, 'now').mockReturnValue(1_000_000 + config.ttl);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      const { context: context2, mockResponse: mockResponse2 } = createMockContext({
        username: 'user-exact-boundary',
        method: 'POST',
        routePath: '/api/boundary',
      });

      expect(guard.canActivate(context2)).toBe(true);
      expect(mockResponse2.setHeader).toHaveBeenCalledWith(HTTP_HEADERS.XRateLimitRemaining, config.limit - 1);
    });

    it('should use request.path when route exists but route.path is undefined', () => {
      const config: ThrottleConfig = { limit: 1, ttl: 10_000 };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      const { context, mockRequest } = createMockContext({
        username: 'user-route-no-path',
        method: 'GET',
        path: '/api/actual-path',
      });
      mockRequest.route = { path: undefined } as unknown as typeof mockRequest.route;
      guard.canActivate(context);

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);
      const { context: context2, mockRequest: mockRequest2 } = createMockContext({
        username: 'user-route-no-path',
        method: 'GET',
        path: '/api/actual-path',
      });
      mockRequest2.route = { path: undefined } as unknown as typeof mockRequest2.route;

      expect(() => guard.canActivate(context2)).toThrow(CustomHttpException);
    });

    it('should block immediately on second request when limit is 0', () => {
      const config: ThrottleConfig = { limit: 0, ttl: 10_000 };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);

      const { context } = createMockContext({
        username: 'user-limit-zero',
        method: 'POST',
        routePath: '/api/zero-limit',
      });
      guard.canActivate(context);

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);
      const { context: context2 } = createMockContext({
        username: 'user-limit-zero',
        method: 'POST',
        routePath: '/api/zero-limit',
      });

      expect(() => guard.canActivate(context2)).toThrow(CustomHttpException);
    });
  });

  describe('reflector metadata resolution', () => {
    it('should read metadata from handler and class', () => {
      const getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const { context, mockHandler, mockClass } = createMockContext({ username: 'user-meta' });

      guard.canActivate(context);

      expect(getAllAndOverrideSpy).toHaveBeenCalledWith(THROTTLE_METADATA_KEY, [mockHandler, mockClass]);
    });
  });

  describe('cache eviction', () => {
    it('should evict expired entries when cache reaches max size', () => {
      const config: ThrottleConfig = { limit: 100, ttl: 5_000 };

      jest.spyOn(Date, 'now').mockReturnValue(1_000_000);

      for (let i = 0; i < 10_001; i += 1) {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);
        const { context } = createMockContext({
          username: `evict-user-${i}`,
          method: 'POST',
          routePath: '/api/evict',
        });
        guard.canActivate(context);
      }

      jest.spyOn(Date, 'now').mockReturnValue(1_000_000 + config.ttl + 1);

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);
      const { context: finalContext } = createMockContext({
        username: 'evict-final-user',
        method: 'POST',
        routePath: '/api/evict',
      });

      expect(guard.canActivate(finalContext)).toBe(true);
    });

    it('should evict oldest entries when cache is full and no entries are expired', () => {
      const config: ThrottleConfig = { limit: 100, ttl: 60_000 };

      jest.spyOn(Date, 'now').mockReturnValue(1_000_000);

      for (let i = 0; i < 10_001; i += 1) {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);
        const { context } = createMockContext({
          username: `full-user-${i}`,
          method: 'POST',
          routePath: '/api/full',
        });
        guard.canActivate(context);
      }

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(config);
      const { context: overflowContext } = createMockContext({
        username: 'full-overflow-user',
        method: 'POST',
        routePath: '/api/full',
      });

      expect(guard.canActivate(overflowContext)).toBe(true);
    });
  });
});
