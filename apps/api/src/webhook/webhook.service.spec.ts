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

/* eslint-disable @typescript-eslint/dot-notation */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import WEBHOOK_CONSTANTS from '@libs/webhook/constants/webhookConstants';
import WEBHOOK_ERROR_MESSAGES from '@libs/webhook/constants/webhookErrorMessages';
import WebhookService from './webhook.service';

jest.mock('ioredis', () =>
  jest.fn().mockImplementation(() => ({
    set: jest.fn().mockResolvedValue('OK'),
    quit: jest.fn().mockResolvedValue('OK'),
  })),
);

describe(WebhookService.name, () => {
  let service: WebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhookService],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
    service['processedEvents'].clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleEvent', () => {
    it('should store event in Redis for eventhandler service key', async () => {
      const body = { username: 'testuser', event: 'login' };

      await service.handleEvent(WEBHOOK_CONSTANTS.USER_AGENTS.EVENTHANDLER, 'evt-1', body);

      expect(service['redis'].set).toHaveBeenCalled();
    });

    it('should skip Redis storage when username is missing for eventhandler', async () => {
      const body = { event: 'login' };

      await service.handleEvent(WEBHOOK_CONSTANTS.USER_AGENTS.EVENTHANDLER, 'evt-2', body);

      expect(service['redis'].set).not.toHaveBeenCalled();
    });

    it('should log for linuxmuster service key', async () => {
      const body = { action: 'sync' };

      await service.handleEvent(WEBHOOK_CONSTANTS.USER_AGENTS.LINUXMUSTER_API, 'evt-3', body);

      expect(service['processedEvents'].has('evt-3')).toBe(true);
    });

    it('should log warning for unknown service key', async () => {
      const body = { data: 'test' };

      await service.handleEvent('unknown-service', 'evt-4', body);

      expect(service['processedEvents'].has('evt-4')).toBe(true);
    });

    it('should throw CONFLICT for duplicate eventId', async () => {
      await service.handleEvent('unknown', 'evt-dup', {});

      await expect(service.handleEvent('unknown', 'evt-dup', {})).rejects.toMatchObject({
        message: WEBHOOK_ERROR_MESSAGES.DUPLICATE_EVENT,
        status: HttpStatus.CONFLICT,
      });
    });
  });

  describe('markProcessed', () => {
    it('should evict oldest entry when exceeding MAX_PROCESSED_EVENTS', () => {
      for (let i = 0; i < WEBHOOK_CONSTANTS.MAX_PROCESSED_EVENTS + 1; i += 1) {
        service['markProcessed'](`event-${i}`);
      }

      expect(service['processedEvents'].has('event-0')).toBe(false);
      expect(service['processedEvents'].size).toBe(WEBHOOK_CONSTANTS.MAX_PROCESSED_EVENTS);
    });
  });

  describe('onModuleDestroy', () => {
    it('should quit redis connection', async () => {
      await service.onModuleDestroy();

      expect(service['redis'].quit).toHaveBeenCalled();
    });
  });
});
