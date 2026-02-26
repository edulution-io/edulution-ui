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
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SchedulerRegistry } from '@nestjs/schedule';
import MailsErrorMessages from '@libs/mail/constants/mails-error-messages';
import MailsService from './mails.service';
import { MailProvider } from './mail-provider.schema';
import AppConfigService from '../appconfig/appconfig.service';
import DockerService from '../docker/docker.service';
import GroupsService from '../groups/groups.service';
import SseService from '../sse/sse.service';
import FilesystemService from '../filesystem/filesystem.service';
import GlobalSettingsService from '../global-settings/global-settings.service';

const mockMailProviderDoc = {
  mailProviderId: 'mp-1',
  name: 'Gmail',
  label: 'Gmail IMAP',
  host: 'imap.gmail.com',
  port: '993',
  encryption: 'SSL',
};

describe(MailsService.name, () => {
  let service: MailsService;
  let mailProviderModel: Record<string, jest.Mock>;

  beforeEach(async () => {
    mailProviderModel = {
      find: jest.fn().mockResolvedValue([mockMailProviderDoc]),
      create: jest.fn().mockResolvedValue(mockMailProviderDoc),
      findOneAndUpdate: jest.fn().mockResolvedValue(mockMailProviderDoc),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailsService,
        SseService,
        ConfigService,
        { provide: getModelToken(MailProvider.name), useValue: mailProviderModel },
        { provide: AppConfigService, useValue: { getAppConfigByName: jest.fn().mockResolvedValue(null) } },
        { provide: DockerService, useValue: { getContainers: jest.fn(), executeContainerCommand: jest.fn() } },
        { provide: GroupsService, useValue: { getInvitedMembers: jest.fn().mockResolvedValue([]) } },
        { provide: FilesystemService, useValue: {} },
        { provide: GlobalSettingsService, useValue: { getAdminGroupsFromCache: jest.fn().mockResolvedValue([]) } },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn() } },
        { provide: SchedulerRegistry, useValue: { addInterval: jest.fn(), deleteInterval: jest.fn() } },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<MailsService>(MailsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMails', () => {
    it('should return empty array when IMAP config is missing', async () => {
      const result = await service.getMails('user@test.com', 'password');
      expect(result).toEqual([]);
    });

    it('should return empty array when email credentials are missing', async () => {
      const result = await service.getMails('', '');
      expect(result).toEqual([]);
    });
  });

  describe('getExternalMailProviderConfig', () => {
    it('should return mail provider configurations', async () => {
      const result = await service.getExternalMailProviderConfig();

      expect(result).toEqual([
        expect.objectContaining({
          id: 'mp-1',
          name: 'Gmail',
          host: 'imap.gmail.com',
        }),
      ]);
      expect(mailProviderModel.find).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND when no providers exist', async () => {
      mailProviderModel.find.mockResolvedValue(null);

      await expect(service.getExternalMailProviderConfig()).rejects.toMatchObject({
        message: MailsErrorMessages.MailProviderNotFound,
      });
    });
  });

  describe('postExternalMailProviderConfig', () => {
    it('should create a new provider when id is empty', async () => {
      const config = {
        id: '',
        name: 'Outlook',
        label: 'Outlook',
        host: 'imap.outlook.com',
        port: '993',
        encryption: 'SSL' as const,
      };

      const result = await service.postExternalMailProviderConfig(config);

      expect(mailProviderModel.create).toHaveBeenCalledWith(config);
      expect(result).toBeDefined();
    });

    it('should update an existing provider when id is provided', async () => {
      const config = {
        id: 'mp-1',
        name: 'Gmail Updated',
        label: 'Gmail',
        host: 'imap.gmail.com',
        port: '993',
        encryption: 'SSL' as const,
      };

      const result = await service.postExternalMailProviderConfig(config);

      expect(mailProviderModel.findOneAndUpdate).toHaveBeenCalledWith(
        { mailProviderId: 'mp-1' },
        { $set: config },
        { upsert: true },
      );
      expect(result).toBeDefined();
    });

    it('should throw NOT_FOUND when create fails', async () => {
      mailProviderModel.create.mockRejectedValue(new Error('DB error'));

      const config = { id: '', name: 'Test', label: 'Test', host: 'test.com', port: '993', encryption: 'SSL' as const };

      await expect(service.postExternalMailProviderConfig(config)).rejects.toMatchObject({
        message: MailsErrorMessages.MailProviderNotFound,
      });
    });
  });

  describe('deleteExternalMailProviderConfig', () => {
    it('should delete a provider and return remaining list', async () => {
      const result = await service.deleteExternalMailProviderConfig('mp-1');

      expect(mailProviderModel.deleteOne).toHaveBeenCalledWith({ mailProviderId: 'mp-1' });
      expect(result).toBeDefined();
    });

    it('should throw NOT_FOUND when provider is not found for deletion', async () => {
      mailProviderModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await expect(service.deleteExternalMailProviderConfig('nonexistent')).rejects.toMatchObject({
        message: MailsErrorMessages.MailProviderNotFound,
      });
    });

    it('should throw NOT_FOUND when deletion throws', async () => {
      mailProviderModel.deleteOne.mockRejectedValue(new Error('DB error'));

      await expect(service.deleteExternalMailProviderConfig('mp-1')).rejects.toMatchObject({
        message: MailsErrorMessages.MailProviderNotFound,
      });
    });
  });

  describe('getSyncJobs', () => {
    it('should return empty array when Mailcow config is missing', async () => {
      const result = await service.getSyncJobs('user@test.com');
      expect(result).toEqual([]);
    });
  });

  describe('prepareMailProviderResponse', () => {
    it('should map MailProviderDocument array to MailProviderConfigDto array', () => {
      const result = MailsService.prepareMailProviderResponse([mockMailProviderDoc as never]);

      expect(result).toEqual([
        expect.objectContaining({
          id: 'mp-1',
          name: 'Gmail',
          label: 'Gmail IMAP',
          host: 'imap.gmail.com',
          port: '993',
          encryption: 'SSL',
        }),
      ]);
    });

    it('should return empty array for empty input', () => {
      const result = MailsService.prepareMailProviderResponse([]);
      expect(result).toEqual([]);
    });
  });

  describe('createSyncJob', () => {
    it('should throw BAD_GATEWAY when Mailcow API fails', async () => {
      Object.defineProperty(service, 'mailcowApi', {
        value: {
          post: jest.fn().mockRejectedValue(new Error('Network error')),
          get: jest.fn(),
        },
        writable: true,
      });

      await expect(service.createSyncJob({ user2: 'user@test.com' } as never, 'user@test.com')).rejects.toMatchObject({
        status: HttpStatus.BAD_GATEWAY,
        message: MailsErrorMessages.MailcowApiCreateSyncJobFailed,
      });
    });
  });

  describe('deleteSyncJobs', () => {
    it('should throw BAD_GATEWAY when Mailcow API fails', async () => {
      Object.defineProperty(service, 'mailcowApi', {
        value: {
          post: jest.fn().mockRejectedValue(new Error('Network error')),
          get: jest.fn(),
        },
        writable: true,
      });

      await expect(service.deleteSyncJobs(['job-1'], 'user@test.com')).rejects.toMatchObject({
        status: HttpStatus.BAD_GATEWAY,
        message: MailsErrorMessages.MailcowApiDeleteSyncJobsFailed,
      });
    });
  });
});
