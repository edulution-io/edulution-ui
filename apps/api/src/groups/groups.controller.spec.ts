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
import JwtUser from '@libs/user/types/jwt/jwtUser';
import SPECIAL_SCHOOLS from '@libs/common/constants/specialSchools';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { GroupsController } from './groups.controller';
import GroupsService from './groups.service';
import mockGroupsService from './groups.service.mock';
import mockCacheManager from '../common/cache-manager.mock';
import GlobalSettingsService from '../global-settings/global-settings.service';

const globalSettingsServiceMock = { updateCache: jest.fn() };

describe(GroupsController.name, () => {
  let controller: GroupsController;
  let service: GroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        {
          provide: GroupsService,
          useValue: mockGroupsService,
        },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: GlobalSettingsService, useValue: globalSettingsServiceMock },
      ],
    }).compile();

    controller = module.get<GroupsController>(GroupsController);
    service = module.get<GroupsService>(GroupsService);

    jest.spyOn(GroupsService, 'fetchCurrentUser').mockResolvedValue({ preferred_username: 'mockedUser' } as JwtUser);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('searchGroups', () => {
    it('should call searchGroups method of groupsService with correct arguments', async () => {
      const groupName = 'testGroup';
      await controller.searchGroups(groupName, SPECIAL_SCHOOLS.GLOBAL);
      expect(service.searchGroups).toHaveBeenCalledWith(SPECIAL_SCHOOLS.GLOBAL, groupName);
    });
  });

  describe('fetchCurrentUser', () => {
    it('should call fetchCurrentUser static method of GroupsService with correct arguments', async () => {
      const token = 'mockToken';
      await controller.fetchCurrentUser(token);
      expect(GroupsService.fetchCurrentUser).toHaveBeenCalledWith(token);
    });
  });
});
