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
import UserPreferencesController from './user-preferences.controller';
import UserPreferencesService from './user-preferences.service';

describe(UserPreferencesController.name, () => {
  let controller: UserPreferencesController;
  let userPreferencesService: Record<string, jest.Mock>;

  beforeEach(async () => {
    userPreferencesService = {
      getForUser: jest.fn().mockResolvedValue({ collapsedBulletins: {}, bulletinBoardGridRows: '1' }),
      updateBulletinCollapsedState: jest.fn().mockResolvedValue({}),
      updateBulletinBoardGridRows: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserPreferencesController],
      providers: [{ provide: UserPreferencesService, useValue: userPreferencesService }],
    }).compile();

    controller = module.get<UserPreferencesController>(UserPreferencesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPreferences', () => {
    it('should delegate to userPreferencesService.getForUser', async () => {
      await controller.getPreferences('teacher1', 'collapsedBulletins');
      expect(userPreferencesService.getForUser).toHaveBeenCalledWith('teacher1', 'collapsedBulletins');
    });
  });

  describe('updateBulletinCollapsed', () => {
    it('should delegate to userPreferencesService.updateBulletinCollapsedState', async () => {
      const dto = { bulletinId: 'b-1', collapsed: true };
      await controller.updateBulletinCollapsed('teacher1', dto);
      expect(userPreferencesService.updateBulletinCollapsedState).toHaveBeenCalledWith('teacher1', dto);
    });
  });

  describe('updateBulletinBoardGridRows', () => {
    it('should delegate to userPreferencesService.updateBulletinBoardGridRows', async () => {
      const dto = { gridRows: '3' };
      await controller.updateBulletinBoardGridRows('teacher1', dto);
      expect(userPreferencesService.updateBulletinBoardGridRows).toHaveBeenCalledWith('teacher1', dto);
    });
  });
});
