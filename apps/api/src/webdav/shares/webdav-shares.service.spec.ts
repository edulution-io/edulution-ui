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
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpStatus } from '@nestjs/common';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import WebdavSharesService from './webdav-shares.service';
import { WebdavShares } from './webdav-shares.schema';
import { AppConfig } from '../../appconfig/appconfig.schema';
import GlobalSettingsService from '../../global-settings/global-settings.service';

describe(WebdavSharesService.name, () => {
  let service: WebdavSharesService;
  let webdavSharesModel: Record<string, jest.Mock>;
  let eventEmitter: Record<string, jest.Mock>;

  beforeEach(async () => {
    webdavSharesModel = {
      find: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
      findOne: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
      create: jest.fn().mockResolvedValue({ displayName: 'test-share', url: 'https://webdav.test.com' }),
      updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ matchedCount: 1 }) }),
      deleteOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) }),
      aggregate: jest.fn().mockResolvedValue([]),
      countDocuments: jest.fn().mockResolvedValue(1),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebdavSharesService,
        { provide: getModelToken(WebdavShares.name), useValue: webdavSharesModel },
        {
          provide: getModelToken(AppConfig.name),
          useValue: { findOne: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }) },
        },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: GlobalSettingsService, useValue: { getAdminGroupsFromCache: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    service = module.get<WebdavSharesService>(WebdavSharesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWebdavShareFromCache', () => {
    it('should load cache and return share', async () => {
      webdavSharesModel.find.mockReturnValue({
        lean: jest
          .fn()
          .mockResolvedValue([
            { displayName: 'test-share', url: 'https://webdav.test.com', type: 'nextcloud', pathname: '/dav' },
          ]),
      });

      const result = await service.getWebdavShareFromCache('test-share');

      expect(result).toEqual(expect.objectContaining({ url: 'https://webdav.test.com' }));
    });
  });

  describe('findAllWebdavServers', () => {
    it('should return root servers via aggregate pipeline', async () => {
      const mockServers = [{ displayName: 'root', isRootServer: true }];
      webdavSharesModel.aggregate.mockResolvedValue(mockServers);

      const result = service.findAllWebdavServers();

      await expect(result).resolves.toEqual(mockServers);
    });
  });

  describe('createWebdavShare', () => {
    it('should create share and emit event', async () => {
      const dto = { displayName: 'new-share', url: 'https://new.webdav.com' } as never;

      const result = await service.createWebdavShare(dto);

      expect(webdavSharesModel.create).toHaveBeenCalledWith(dto);
      expect(eventEmitter.emit).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw on DB failure', async () => {
      webdavSharesModel.create.mockRejectedValue(new Error('DB error'));

      await expect(service.createWebdavShare({ displayName: 'fail' } as never)).rejects.toMatchObject({
        message: CommonErrorMessages.DB_ACCESS_FAILED,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('updateWebdavShare', () => {
    it('should update share and emit event', async () => {
      const result = await service.updateWebdavShare('share-1', { displayName: 'updated' } as never);

      expect(webdavSharesModel.updateOne).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NOT_FOUND when share does not exist', async () => {
      webdavSharesModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ matchedCount: 0 }),
      });

      await expect(service.updateWebdavShare('nonexistent', {} as never)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('deleteWebdavShare', () => {
    it('should delete share and emit event', async () => {
      await service.deleteWebdavShare('share-1');

      expect(webdavSharesModel.deleteOne).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should throw on DB failure', async () => {
      webdavSharesModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(service.deleteWebdavShare('bad-id')).rejects.toMatchObject({
        message: CommonErrorMessages.DB_ACCESS_FAILED,
      });
    });
  });
});
