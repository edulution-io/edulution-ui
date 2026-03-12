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
import MailsController from './mails.controller';
import MailsService from './mails.service';
import MailIdleService from './mail-idle.service';
import UsersService from '../users/users.service';
import GlobalSettingsService from '../global-settings/global-settings.service';

describe(MailsController.name, () => {
  let controller: MailsController;
  let mailsService: Record<string, jest.Mock>;
  let mailIdleService: Record<string, jest.Mock>;
  let usersService: Record<string, jest.Mock>;

  beforeEach(async () => {
    mailsService = {
      getMails: jest.fn().mockResolvedValue([{ id: 1, subject: 'Test', flags: new Set() }]),
      getExternalMailProviderConfig: jest.fn().mockResolvedValue([]),
      postExternalMailProviderConfig: jest.fn().mockResolvedValue([]),
      deleteExternalMailProviderConfig: jest.fn().mockResolvedValue([]),
      getSyncJobs: jest.fn().mockResolvedValue([]),
      createSyncJob: jest.fn().mockResolvedValue([]),
      deleteSyncJobs: jest.fn().mockResolvedValue([]),
      checkSogoThemeVersion: jest.fn().mockResolvedValue({ isUpdateAvailable: false }),
      updateSogoTheme: jest.fn().mockResolvedValue(undefined),
    };

    mailIdleService = {
      fetchUnseenMails: jest.fn().mockResolvedValue(null),
      startIdle: jest.fn(),
      getConnectionStats: jest.fn().mockReturnValue({ current: 5, max: 100 }),
    };

    usersService = {
      getPassword: jest.fn().mockResolvedValue('encrypted-password'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailsController],
      providers: [
        { provide: MailsService, useValue: mailsService },
        { provide: MailIdleService, useValue: mailIdleService },
        { provide: UsersService, useValue: usersService },
        { provide: GlobalSettingsService, useValue: { getAdminGroupsFromCache: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    controller = module.get<MailsController>(MailsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMails', () => {
    it('should return idle mails when available', async () => {
      const idleMails = [{ id: 1, subject: 'Cached Mail', flags: new Set() }];
      mailIdleService.fetchUnseenMails.mockResolvedValue(idleMails);

      const result = await controller.getMails('teacher', 'teacher@school.de');

      expect(result).toEqual(idleMails);
      expect(mailsService.getMails).not.toHaveBeenCalled();
    });

    it('should fall back to IMAP fetch when idle mails are null', async () => {
      const result = await controller.getMails('teacher', 'teacher@school.de');

      expect(usersService.getPassword).toHaveBeenCalledWith('teacher');
      expect(mailsService.getMails).toHaveBeenCalledWith('teacher@school.de', 'encrypted-password');
      expect(mailIdleService.startIdle).toHaveBeenCalledWith('teacher', 'teacher@school.de', 'encrypted-password');
      expect(result).toEqual([{ id: 1, subject: 'Test', flags: new Set() }]);
    });
  });

  describe('getExternalMailProviderConfig', () => {
    it('should delegate to mailsService', async () => {
      await controller.getExternalMailProviderConfig();
      expect(mailsService.getExternalMailProviderConfig).toHaveBeenCalled();
    });
  });

  describe('postExternalMailProviderConfig', () => {
    it('should delegate to mailsService with config body', async () => {
      const config = { id: '', name: 'Test', label: 'Test', host: 'test.com', port: '993', encryption: 'SSL' };
      await controller.postExternalMailProviderConfig(config as never);
      expect(mailsService.postExternalMailProviderConfig).toHaveBeenCalledWith(config);
    });
  });

  describe('deleteExternalMailProviderConfig', () => {
    it('should delegate to mailsService with provider id', async () => {
      await controller.deleteExternalMailProviderConfig('mp-1');
      expect(mailsService.deleteExternalMailProviderConfig).toHaveBeenCalledWith('mp-1');
    });
  });

  describe('getSyncJob', () => {
    it('should delegate to mailsService.getSyncJobs', async () => {
      await controller.getSyncJob('user@school.de');
      expect(mailsService.getSyncJobs).toHaveBeenCalledWith('user@school.de');
    });
  });

  describe('postSyncJob', () => {
    it('should delegate to mailsService.createSyncJob', async () => {
      const dto = { user2: 'user@school.de' };
      await controller.postSyncJob(dto as never, 'user@school.de');
      expect(mailsService.createSyncJob).toHaveBeenCalledWith(dto, 'user@school.de');
    });
  });

  describe('deleteSyncJobs', () => {
    it('should delegate to mailsService.deleteSyncJobs', async () => {
      const ids = ['job-1', 'job-2'];
      await controller.deleteSyncJobs(ids, 'user@school.de');
      expect(mailsService.deleteSyncJobs).toHaveBeenCalledWith(ids, 'user@school.de');
    });
  });

  describe('checkSogoThemeVersion', () => {
    it('should delegate to mailsService.checkSogoThemeVersion', async () => {
      await controller.checkSogoThemeVersion();
      expect(mailsService.checkSogoThemeVersion).toHaveBeenCalled();
    });
  });

  describe('updateSogoThemeManually', () => {
    it('should delegate to mailsService.updateSogoTheme', async () => {
      await controller.updateSogoThemeManually();
      expect(mailsService.updateSogoTheme).toHaveBeenCalled();
    });
  });

  describe('getConnectionStats', () => {
    it('should delegate to mailIdleService.getConnectionStats', () => {
      const result = controller.getConnectionStats();
      expect(mailIdleService.getConnectionStats).toHaveBeenCalled();
      expect(result).toEqual({ current: 5, max: 100 });
    });
  });
});
