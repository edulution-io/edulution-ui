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
import type JWTUser from '@libs/user/types/jwt/jwtUser';
import { BulletinCategoryPermissionType } from '@libs/appconfig/types/bulletinCategoryPermissionType';
import BulletinCategoryController from './bulletin-category.controller';
import BulletinCategoryService from './bulletin-category.service';
import GlobalSettingsService from '../global-settings/global-settings.service';

describe(BulletinCategoryController.name, () => {
  let controller: BulletinCategoryController;
  let bulletinCategoryService: Record<string, jest.Mock>;

  const mockUser = { preferred_username: 'teacher1', ldapGroups: ['/teachers'] } as unknown as JWTUser;

  beforeEach(async () => {
    bulletinCategoryService = {
      findAll: jest.fn().mockResolvedValue([{ name: 'cat-1' }]),
      create: jest.fn().mockResolvedValue({ name: 'new-cat' }),
      checkIfNameExists: jest.fn().mockResolvedValue({ exists: false }),
      update: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      remove: jest.fn().mockResolvedValue(undefined),
      setPosition: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BulletinCategoryController],
      providers: [
        { provide: BulletinCategoryService, useValue: bulletinCategoryService },
        { provide: GlobalSettingsService, useValue: { getAdminGroupsFromCache: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    controller = module.get<BulletinCategoryController>(BulletinCategoryController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to bulletinCategoryService.findAll with user and permission', async () => {
      await controller.findAll(mockUser, 'read' as BulletinCategoryPermissionType);
      expect(bulletinCategoryService.findAll).toHaveBeenCalledWith(mockUser, 'read');
    });
  });

  describe('create', () => {
    it('should delegate to bulletinCategoryService.create', async () => {
      const dto = { name: 'new-cat' } as never;
      await controller.create(mockUser, dto);
      expect(bulletinCategoryService.create).toHaveBeenCalledWith(mockUser, dto);
    });
  });

  describe('checkName', () => {
    it('should delegate to bulletinCategoryService.checkIfNameExists', async () => {
      const result = await controller.checkName('test-name');
      expect(bulletinCategoryService.checkIfNameExists).toHaveBeenCalledWith('test-name');
      expect(result).toEqual({ exists: false });
    });
  });

  describe('update', () => {
    it('should delegate to bulletinCategoryService.update with id and dto', async () => {
      const dto = { name: 'updated-cat' } as never;
      await controller.update('cat-1', dto);
      expect(bulletinCategoryService.update).toHaveBeenCalledWith('cat-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to bulletinCategoryService.remove with id', async () => {
      await controller.remove('cat-1');
      expect(bulletinCategoryService.remove).toHaveBeenCalledWith('cat-1');
    });
  });

  describe('setPosition', () => {
    it('should delegate to bulletinCategoryService.setPosition with categoryId and position', async () => {
      await controller.setPosition({ categoryId: 'cat-1', position: 2 });
      expect(bulletinCategoryService.setPosition).toHaveBeenCalledWith('cat-1', 2);
    });
  });
});
