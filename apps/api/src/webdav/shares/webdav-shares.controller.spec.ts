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
import WebdavSharesController from './webdav-shares.controller';
import WebdavSharesService from './webdav-shares.service';
import GlobalSettingsService from '../../global-settings/global-settings.service';

describe(WebdavSharesController.name, () => {
  let controller: WebdavSharesController;
  let webdavSharesService: Record<string, jest.Mock>;

  beforeEach(async () => {
    webdavSharesService = {
      findAllWebdavServers: jest.fn().mockResolvedValue([{ displayName: 'root', isRootServer: true }]),
      findAllWebdavShares: jest.fn().mockResolvedValue([{ displayName: 'share1' }]),
      createWebdavShare: jest.fn().mockResolvedValue({ displayName: 'new-share' }),
      updateWebdavShare: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteWebdavShare: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebdavSharesController],
      providers: [
        { provide: WebdavSharesService, useValue: webdavSharesService },
        { provide: GlobalSettingsService, useValue: { getAdminGroupsFromCache: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    controller = module.get<WebdavSharesController>(WebdavSharesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllShares', () => {
    it('should return only root servers when isRootServer is true', async () => {
      const result = await controller.findAllShares(true, ['/school']);
      expect(webdavSharesService.findAllWebdavServers).toHaveBeenCalled();
      expect(webdavSharesService.findAllWebdavShares).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should return both servers and shares when isRootServer is undefined', async () => {
      const result = await controller.findAllShares(undefined, ['/school']);
      expect(webdavSharesService.findAllWebdavServers).toHaveBeenCalled();
      expect(webdavSharesService.findAllWebdavShares).toHaveBeenCalledWith(['/school']);
      expect(result).toHaveLength(2);
    });

    it('should return only shares when isRootServer is false', async () => {
      const result = await controller.findAllShares(false, ['/school']);
      expect(webdavSharesService.findAllWebdavServers).not.toHaveBeenCalled();
      expect(webdavSharesService.findAllWebdavShares).toHaveBeenCalledWith(['/school']);
      expect(result).toHaveLength(1);
    });
  });

  describe('createWebdavShare', () => {
    it('should delegate to webdavSharesService.createWebdavShare', async () => {
      const dto = { displayName: 'new-share', url: 'https://webdav.test.com' };
      await controller.createWebdavShare(dto as never);
      expect(webdavSharesService.createWebdavShare).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateWebdavShare', () => {
    it('should delegate to webdavSharesService.updateWebdavShare', async () => {
      const dto = { displayName: 'updated' };
      await controller.updateWebdavShare('share-1', dto as never);
      expect(webdavSharesService.updateWebdavShare).toHaveBeenCalledWith('share-1', dto);
    });
  });

  describe('deleteWebdavShare', () => {
    it('should delegate to webdavSharesService.deleteWebdavShare', async () => {
      await controller.deleteWebdavShare('share-1');
      expect(webdavSharesService.deleteWebdavShare).toHaveBeenCalledWith('share-1');
    });
  });
});
