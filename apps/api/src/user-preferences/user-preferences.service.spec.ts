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
import UserPreferencesService from './user-preferences.service';
import { UserPreferences } from './user-preferences.schema';

describe(UserPreferencesService.name, () => {
  let service: UserPreferencesService;
  let userPreferencesModel: Record<string, jest.Mock>;

  beforeEach(async () => {
    userPreferencesModel = {
      findOne: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
      }),
      findOneAndUpdate: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ username: 'testuser' }) }),
      updateMany: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 2 }) }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPreferencesService,
        { provide: getModelToken(UserPreferences.name), useValue: userPreferencesModel },
      ],
    }).compile();

    service = module.get<UserPreferencesService>(UserPreferencesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getForUser', () => {
    it('should return defaults when no preferences found', async () => {
      const result = await service.getForUser('testuser', 'collapsedBulletins,bulletinBoardGridRows');

      expect(result).toEqual({
        collapsedBulletins: {},
        bulletinBoardGridRows: '1',
      });
    });

    it('should return stored preferences when found', async () => {
      const stored = { collapsedBulletins: { 'b-1': true }, bulletinBoardGridRows: '3' };
      userPreferencesModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(stored) }),
      });

      const result = await service.getForUser('testuser', 'collapsedBulletins,bulletinBoardGridRows');

      expect(result.collapsedBulletins).toEqual({ 'b-1': true });
      expect(result.bulletinBoardGridRows).toBe('3');
    });
  });

  describe('updateBulletinCollapsedState', () => {
    it('should update collapsed state for a bulletin', async () => {
      await service.updateBulletinCollapsedState('testuser', { bulletinId: 'b-1', collapsed: true });

      expect(userPreferencesModel.findOneAndUpdate).toHaveBeenCalledWith({ username: 'testuser' }, expect.anything(), {
        new: true,
        upsert: true,
      });
    });
  });

  describe('updateBulletinBoardGridRows', () => {
    it('should update grid rows setting', async () => {
      await service.updateBulletinBoardGridRows('testuser', { gridRows: '2' });

      expect(userPreferencesModel.findOneAndUpdate).toHaveBeenCalledWith({ username: 'testuser' }, expect.anything(), {
        new: true,
        upsert: true,
      });
    });
  });

  describe('unsetCollapsedForBulletins', () => {
    it('should unset collapsed state for given bulletin ids', async () => {
      await service.unsetCollapsedForBulletins(['b-1', 'b-2']);

      expect(userPreferencesModel.updateMany).toHaveBeenCalled();
    });

    it('should do nothing for empty array', async () => {
      await service.unsetCollapsedForBulletins([]);

      expect(userPreferencesModel.updateMany).not.toHaveBeenCalled();
    });
  });
});
