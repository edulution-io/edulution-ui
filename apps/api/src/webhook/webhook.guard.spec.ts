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

import { HttpStatus } from '@nestjs/common';
import WEBHOOK_CONSTANTS from '@libs/webhook/constants/webhookConstants';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import { createMockExecutionContext } from '@libs/test-utils/api-mocks';
import WebhookGuard from './webhook.guard';
import WebhookClientsService from '../webhook-clients/webhook-clients.service';

describe(WebhookGuard.name, () => {
  let guard: WebhookGuard;
  let webhookClientsService: WebhookClientsService;

  const validTimestamp = String(Math.floor(Date.now() / 1000));

  beforeEach(() => {
    webhookClientsService = {
      isValidClient: jest.fn().mockReturnValue(true),
    } as unknown as WebhookClientsService;

    guard = new WebhookGuard(webhookClientsService);
  });

  it('should allow request with valid webhook headers', () => {
    const context = createMockExecutionContext({
      headers: {
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_KEY]: 'valid-api-key',
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_TIMESTAMP]: validTimestamp,
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_EVENT_ID]: 'event-001',
        [HTTP_HEADERS.UserAgent]: 'edulution-eventhandler',
      },
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(webhookClientsService.isValidClient).toHaveBeenCalledWith('valid-api-key', 'edulution-eventhandler');
  });

  it('should throw 400 when webhook key header is missing', () => {
    const context = createMockExecutionContext({
      headers: {
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_TIMESTAMP]: validTimestamp,
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_EVENT_ID]: 'event-001',
      },
    });

    expect(() => guard.canActivate(context)).toThrow();
    try {
      guard.canActivate(context);
    } catch (error) {
      expect((error as { status: number }).status).toBe(HttpStatus.BAD_REQUEST);
    }
  });

  it('should throw 400 when webhook timestamp header is missing', () => {
    const context = createMockExecutionContext({
      headers: {
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_KEY]: 'valid-api-key',
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_EVENT_ID]: 'event-001',
      },
    });

    expect(() => guard.canActivate(context)).toThrow();
  });

  it('should throw 400 when webhook event id header is missing', () => {
    const context = createMockExecutionContext({
      headers: {
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_KEY]: 'valid-api-key',
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_TIMESTAMP]: validTimestamp,
      },
    });

    expect(() => guard.canActivate(context)).toThrow();
  });

  it('should throw 401 when api key is invalid', () => {
    (webhookClientsService.isValidClient as jest.Mock).mockReturnValue(false);

    const context = createMockExecutionContext({
      headers: {
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_KEY]: 'invalid-api-key',
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_TIMESTAMP]: validTimestamp,
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_EVENT_ID]: 'event-001',
        [HTTP_HEADERS.UserAgent]: 'edulution-eventhandler',
      },
    });

    expect(() => guard.canActivate(context)).toThrow();
    try {
      guard.canActivate(context);
    } catch (error) {
      expect((error as { status: number }).status).toBe(HttpStatus.UNAUTHORIZED);
    }
  });

  it('should throw 401 when timestamp is expired (too old)', () => {
    const oldTimestamp = String(Math.floor(Date.now() / 1000) - 600);

    const context = createMockExecutionContext({
      headers: {
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_KEY]: 'valid-api-key',
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_TIMESTAMP]: oldTimestamp,
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_EVENT_ID]: 'event-001',
        [HTTP_HEADERS.UserAgent]: 'edulution-eventhandler',
      },
    });

    expect(() => guard.canActivate(context)).toThrow();
    try {
      guard.canActivate(context);
    } catch (error) {
      expect((error as { status: number }).status).toBe(HttpStatus.UNAUTHORIZED);
    }
  });

  it('should throw 401 when timestamp is in the future', () => {
    const futureTimestamp = String(Math.floor(Date.now() / 1000) + 600);

    const context = createMockExecutionContext({
      headers: {
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_KEY]: 'valid-api-key',
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_TIMESTAMP]: futureTimestamp,
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_EVENT_ID]: 'event-001',
        [HTTP_HEADERS.UserAgent]: 'edulution-eventhandler',
      },
    });

    expect(() => guard.canActivate(context)).toThrow();
    try {
      guard.canActivate(context);
    } catch (error) {
      expect((error as { status: number }).status).toBe(HttpStatus.UNAUTHORIZED);
    }
  });

  it('should throw 401 when timestamp is not a valid number', () => {
    const context = createMockExecutionContext({
      headers: {
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_KEY]: 'valid-api-key',
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_TIMESTAMP]: 'not-a-number',
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_EVENT_ID]: 'event-001',
        [HTTP_HEADERS.UserAgent]: 'edulution-eventhandler',
      },
    });

    expect(() => guard.canActivate(context)).toThrow();
  });

  it('should use empty string as default user agent when header is missing', () => {
    const context = createMockExecutionContext({
      headers: {
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_KEY]: 'valid-api-key',
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_TIMESTAMP]: validTimestamp,
        [WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_EVENT_ID]: 'event-001',
      },
    });

    guard.canActivate(context);

    expect(webhookClientsService.isValidClient).toHaveBeenCalledWith('valid-api-key', '');
  });
});
