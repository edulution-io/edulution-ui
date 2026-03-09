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
import WebhookClientsController from './webhook-clients.controller';
import WebhookClientsService from './webhook-clients.service';
import GlobalSettingsService from '../global-settings/global-settings.service';

describe(WebhookClientsController.name, () => {
  let controller: WebhookClientsController;
  let webhookClientsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    webhookClientsService = {
      getAll: jest.fn().mockResolvedValue([{ id: 'c-1', userAgent: 'agent' }]),
      create: jest.fn().mockResolvedValue({ id: 'c-2', userAgent: 'new-agent' }),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookClientsController],
      providers: [
        { provide: WebhookClientsService, useValue: webhookClientsService },
        { provide: GlobalSettingsService, useValue: { getAdminGroupsFromCache: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    controller = module.get<WebhookClientsController>(WebhookClientsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should delegate to webhookClientsService.getAll', async () => {
      const result = await controller.getAll();
      expect(webhookClientsService.getAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should delegate to webhookClientsService.create with userAgent', async () => {
      await controller.create('new-agent');
      expect(webhookClientsService.create).toHaveBeenCalledWith('new-agent');
    });
  });

  describe('delete', () => {
    it('should delegate to webhookClientsService.delete with id', async () => {
      await controller.delete('c-1');
      expect(webhookClientsService.delete).toHaveBeenCalledWith('c-1');
    });
  });
});
