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
import { getModelToken } from '@nestjs/mongoose';
import { HttpStatus } from '@nestjs/common';
import WebhookClientsService from './webhook-clients.service';
import { WebhookClient } from './webhook-client.schema';

describe(WebhookClientsService.name, () => {
  let service: WebhookClientsService;
  let webhookClientModel: Record<string, jest.Mock>;

  beforeEach(async () => {
    webhookClientModel = {
      find: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
      create: jest.fn().mockResolvedValue({
        id: 'client-1',
        userAgent: 'test-agent',
        apiKey: 'generated-key',
        createdAt: new Date(),
      }),
      findByIdAndDelete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhookClientsService, { provide: getModelToken(WebhookClient.name), useValue: webhookClientModel }],
    }).compile();

    service = module.get<WebhookClientsService>(WebhookClientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loadCache', () => {
    it('should populate internal cache from database', async () => {
      webhookClientModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { apiKey: 'key-1', userAgent: 'agent-1' },
          { apiKey: 'key-2', userAgent: 'agent-2' },
        ]),
      });

      await service.loadCache();

      expect(service['webhookClientsMap'].size).toBe(2);
    });

    it('should throw on DB failure', async () => {
      webhookClientModel.find.mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(service.loadCache()).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('isValidClient', () => {
    it('should return false when apiKey is not in cache', () => {
      expect(service.isValidClient('unknown-key', 'agent')).toBe(false);
    });

    it('should return true when apiKey matches and userAgent starts with cached value', async () => {
      webhookClientModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ apiKey: 'key-1', userAgent: 'my-agent' }]),
      });
      await service.loadCache();

      expect(service.isValidClient('key-1', 'my-agent/1.0')).toBe(true);
    });

    it('should return false when userAgent does not match', async () => {
      webhookClientModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ apiKey: 'key-1', userAgent: 'my-agent' }]),
      });
      await service.loadCache();

      expect(service.isValidClient('key-1', 'other-agent/1.0')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return mapped client DTOs', async () => {
      const mockClient = {
        id: 'client-1',
        userAgent: 'test-agent',
        apiKey: 'api-key-1',
        createdAt: new Date('2025-01-01'),
      };
      webhookClientModel.find.mockResolvedValue([mockClient]);

      const result = await service.getAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({ userAgent: 'test-agent' }));
    });
  });

  describe('create', () => {
    it('should create a client and reload cache', async () => {
      webhookClientModel.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      const result = await service.create('new-agent');

      expect(webhookClientModel.create).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ userAgent: 'test-agent' }));
    });
  });

  describe('delete', () => {
    it('should delete client and reload cache', async () => {
      webhookClientModel.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      await service.delete('client-1');

      expect(webhookClientModel.findByIdAndDelete).toHaveBeenCalledWith('client-1');
    });
  });
});
