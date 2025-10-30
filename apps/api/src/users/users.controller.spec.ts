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

/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import UserDto from '@libs/user/types/user.dto';
import LdapGroups from '@libs/groups/types/ldapGroups';
import { UsersController } from './users.controller';
import UsersService from './users.service';
import { User } from './user.schema';
import UpdateUserDto from './dto/update-user.dto';
import mockCacheManager from '../common/cache-manager.mock';
import GlobalSettingsService from '../global-settings/global-settings.service';

const mockUserModel = {
  insertMany: jest.fn(),
  bulkWrite: jest.fn(),
  find: jest.fn(),
  deleteOne: jest.fn(),
};

const mockUsersService = {
  createOrUpdate: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  searchUsersByName: jest.fn(),
  getPassword: jest.fn(),
};

const mockLdapGroups: LdapGroups = {
  schools: ['school'],
  projects: ['project1', 'project2'],
  projectPaths: ['/path/to/project1', '/path/to/project2'],
  classes: ['class1A', 'class2B'],
  classPaths: ['/path/to/class1A', '/path/to/class2B'],
  roles: ['teacher'],
  others: ['group1', 'group2'],
};

const globalSettingsServiceMock = { updateCache: jest.fn() };

describe(UsersController.name, () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: GlobalSettingsService, useValue: globalSettingsServiceMock },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('createOrUpdate', () => {
    it('should call register method of usersService with correct arguments', async () => {
      const registerDto: UserDto = {
        username: 'testuser',
        email: 'test@example.com',
        ldapGroups: mockLdapGroups,
        password: 'password',
        encryptKey: 'encryptKey',
      };
      await controller.createOrUpdate(registerDto);
      expect(service.createOrUpdate).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('findOne', () => {
    it('should call findOne method of usersService with correct arguments', async () => {
      const username = 'testuser';
      await controller.findOne(username);
      expect(service.findOne).toHaveBeenCalledWith(username);
    });
  });

  describe('findOneKey', () => {
    it('should call getPassword method of usersService with correct arguments', async () => {
      jest.spyOn(service, 'getPassword').mockResolvedValue('password');
      const username = 'testuser';
      const currentUsername = 'testuser';
      await controller.findOneKey(username, currentUsername);
      expect(service.getPassword).toHaveBeenCalledWith(currentUsername);
    });
  });

  describe('update', () => {
    it('should call update method of usersService with correct arguments', async () => {
      const username = 'testuser';
      const updateUserDto: UpdateUserDto = {
        username: 'updatedUser',
        email: 'updated@example.com',
        password: 'password',
      };
      await controller.update(username, updateUserDto);
      expect(service.update).toHaveBeenCalledWith(username, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should call remove method of usersService with correct arguments', async () => {
      const username = 'testuser';
      await controller.remove(username);
      expect(service.remove).toHaveBeenCalledWith(username);
    });
  });

  describe('search', () => {
    it('should call searchUsersByName method of usersService with correct arguments', async () => {
      const searchString = 'test';
      const school = 'testschool';
      await controller.search(searchString, school);
      expect(service.searchUsersByName).toHaveBeenCalledWith(school, searchString);
    });
  });
});
