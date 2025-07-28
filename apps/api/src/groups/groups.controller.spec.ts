/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { Test, TestingModule } from '@nestjs/testing';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import SPECIAL_SCHOOLS from '@libs/common/constants/specialSchools';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { GroupsController } from './groups.controller';
import GroupsService from './groups.service';
import mockGroupsService from './groups.service.mock';
import GlobalSettingsService from '../global-settings/global-settings.service';

const cacheManagerMock = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

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
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
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
