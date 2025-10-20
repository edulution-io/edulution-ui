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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import CryptoJS from 'crypto-js';
import { LDAPUser } from '@libs/groups/types/ldapUser';
import UserDto from '@libs/user/types/user.dto';
import { USERS_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import LdapGroups from '@libs/groups/types/ldapGroups';
import USER_DB_PROJECTION from '@libs/user/constants/user-db-projection';
import { getDecryptedPassword } from '@libs/common/utils';
import { ALL_USERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User, UserDocument } from './user.schema';
import UsersService from './users.service';
import GroupsService from '../groups/groups.service';
import mockGroupsService from '../groups/groups.service.mock';
import UpdateUserDto from './dto/update-user.dto';
import cacheManagerMock from '../common/mocks/cacheManagerMock';
import { UserAccounts } from './account.schema';

jest.mock('axios');

const mockUser: UserDocument = {
  username: 'testuser',
  email: 'testuser@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: 'password123',
  ldapGroups: {
    schools: ['school1', 'school2'],
    projects: ['project1', 'project2'],
    projectPaths: ['/project1', '/project2'],
    classes: ['class1', 'class2'],
    classPaths: ['/class1', '/class2'],
    roles: ['role1', 'role2'],
    others: ['group1', 'group2'],
  },
  mfaEnabled: false,
  totpSecret: '',
} as UserDocument;

const cachedUsers = [
  {
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    school: 'agy',
  },
];

const fetchedUsers: LDAPUser[] = [
  {
    id: '2',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
    emailVerified: true,
    attributes: {
      LDAP_ENTRY_DN: ['dn'],
      LDAP_ID: ['id'],
      modifyTimestamp: ['timestamp'],
      createTimestamp: ['timestamp'],
      school: ['agy'],
    },
    createdTimestamp: Date.now(),
    enabled: true,
    totp: false,
    federationLink: 'link',
    disableableCredentialTypes: [],
    requiredActions: [],
    notBefore: 0,
    access: {
      manageGroupMembership: false,
      view: true,
      mapRoles: false,
      impersonate: false,
      manage: false,
    },
  },
];

const userModelMock = {
  create: jest.fn().mockResolvedValue(mockUser),

  find: jest.fn().mockReturnValue({
    lean: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser),
    }),
  }),
  findOne: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(mockUser),
  }),
  findOneAndUpdate: jest.fn().mockReturnValue({
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(mockUser),
  }),
  deleteOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  }),
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

describe(UsersService.name, () => {
  let service: UsersService;
  let model: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModelMock,
        },
        {
          provide: getModelToken(UserAccounts.name),
          useValue: userModelMock,
        },
        { provide: GroupsService, useValue: mockGroupsService },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  describe('createOrUpdate', () => {
    it('should update existing user', async () => {
      const userDto = new UserDto();
      userDto.username = 'testuser';
      userDto.ldapGroups = mockLdapGroups;
      userDto.password = 'password';
      userDto.email = 'test@example.com';

      await service.createOrUpdate(userDto);

      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { username: userDto.username },
        {
          $set: {
            email: userDto.email,
            firstName: userDto.firstName,
            lastName: userDto.lastName,
            password: userDto.password,
            ldapGroups: userDto.ldapGroups,
          },
        },
        { new: true, upsert: true, projection: USER_DB_PROJECTION },
      );
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(model, 'findOne').mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockUser),
      } as unknown as any);

      const user = await service.findOne('testuser');

      expect(user).toEqual(mockUser);
      expect(model.findOne).toHaveBeenCalledWith({ username: 'testuser' });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userDto = new UpdateUserDto();
      userDto.username = 'testuser';
      userDto.ldapGroups = mockLdapGroups;
      userDto.password = 'password';
      userDto.email = 'test@example.com';

      await service.update(userDto.username, userDto);

      expect(model.findOneAndUpdate).toHaveBeenNthCalledWith(
        1,
        { username: userDto.username },
        {
          $set: {
            email: userDto.email,
            password: userDto.password,
            ldapGroups: userDto.ldapGroups,
          },
        },
        { new: true, upsert: true, projection: USER_DB_PROJECTION },
      );
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const result = await service.remove('testuser');
      expect(result).toBeTruthy();
      expect(model.deleteOne).toHaveBeenCalledWith({ username: 'testuser' });
    });
  });

  describe('findAllCachedUsers', () => {
    it('should return cached users if available', async () => {
      const school = 'agy';
      cacheManagerMock.get.mockResolvedValue(cachedUsers);

      const result = await service.findAllCachedUsers(school);
      expect(result).toEqual(cachedUsers);
      expect(cacheManagerMock.get).toHaveBeenCalledWith(ALL_USERS_CACHE_KEY + school);
    });

    it('should fetch users from external API if not cached', async () => {
      const school = 'agy';
      cacheManagerMock.get.mockResolvedValueOnce(null).mockResolvedValueOnce(cachedUsers);
      mockGroupsService.fetchAllUsers.mockResolvedValue(fetchedUsers);

      const result = await service.findAllCachedUsers(school);
      expect(result).toEqual(cachedUsers);
      expect(cacheManagerMock.set).toHaveBeenCalledWith(ALL_USERS_CACHE_KEY + school, cachedUsers, USERS_CACHE_TTL_MS);
    });
  });

  describe('searchUsersByName', () => {
    it('should return users matching the search string', async () => {
      jest.spyOn(service, 'findAllCachedUsers').mockResolvedValue(cachedUsers);

      const result = await service.searchUsersByName('agy', 'test');
      expect(result).toEqual(cachedUsers);
      expect(service.findAllCachedUsers).toHaveBeenCalledWith('agy');
    });
  });

  describe('getPassword', () => {
    it("should return the user's password", async () => {
      const originalPassword = 'password';
      const encryptKey = 'encryptKey';
      const encryptedPassword = CryptoJS.AES.encrypt(originalPassword, encryptKey).toString();

      const userData = { password: encryptedPassword, encryptKey };
      model.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(userData),
      });

      const user = await service.getPassword('testuser');

      expect(user).toEqual(getDecryptedPassword(encryptedPassword, encryptKey));
      expect(model.findOne).toHaveBeenCalledWith({ username: 'testuser' }, 'password encryptKey');
    });
  });
});
