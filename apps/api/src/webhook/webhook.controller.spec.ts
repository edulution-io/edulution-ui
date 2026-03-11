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

import { Test, TestingModule } from '@nestjs/testing';
import WebhookController from './webhook.controller';
import WebhookService from './webhook.service';
import WebhookClientsService from '../webhook-clients/webhook-clients.service';

describe(WebhookController.name, () => {
  let controller: WebhookController;
  let webhookService: Record<string, jest.Mock>;

  beforeEach(async () => {
    webhookService = {
      handleEvent: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        { provide: WebhookService, useValue: webhookService },
        {
          provide: WebhookClientsService,
          useValue: { isValidClient: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleWebhook', () => {
    it('should extract service key from userAgent and delegate to webhookService', async () => {
      const body = { username: 'testuser' };
      const result = await controller.handleWebhook('evt-1', 'eventhandler/1.0', body);

      expect(webhookService.handleEvent).toHaveBeenCalledWith('eventhandler', 'evt-1', body);
      expect(result).toEqual({ status: 'ok' });
    });

    it('should handle userAgent without version suffix', async () => {
      const body = {};
      await controller.handleWebhook('evt-2', 'linuxmuster-api', body);

      expect(webhookService.handleEvent).toHaveBeenCalledWith('linuxmuster-api', 'evt-2', body);
    });
  });
});
