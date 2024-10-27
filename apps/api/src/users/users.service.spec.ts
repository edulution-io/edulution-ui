/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LDAPUser } from '@libs/groups/types/ldapUser';
import UserDto from '@libs/user/types/user.dto';
import { DEFAULT_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import LdapGroups from '@libs/groups/types/ldapGroups';
import USER_DB_PROJECTION from '@libs/user/constants/user-db-projections';
import { getDecryptedPassword } from '@libs/common/utils';
import { User, UserDocument } from './user.schema';
import UsersService from './users.service';
import GroupsService from '../groups/groups.service';
import mockGroupsService from '../groups/groups.service.mock';
import UpdateUserDto from './dto/update-user.dto';

jest.mock('axios');
const mockToken = 'token';

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

const cachedUsersBySchool: Record<string, LDAPUser[]> = {
  agy: [
    {
      id: '1',
      username: 'cacheduser',
      firstName: 'Cached',
      lastName: 'User',
      email: 'cacheduser@example.com',
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
  ],
};

const fetchedUsersBySchool: Record<string, LDAPUser[]> = {
  agy: [
    {
      id: '2',
      username: 'fetcheduser',
      firstName: 'Fetched',
      lastName: 'User',
      email: 'fetcheduser@example.com',
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
  ],
};

jest.mock('../groups/groups.service', () => ({
  fetchAllUsers: jest.fn(() => fetchedUsersBySchool),
}));

const userModelMock = {
  create: jest.fn().mockResolvedValue(mockUser),

  find: jest.fn().mockReturnValue({
    lean: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser),
    }),
  }),
  findOne: jest.fn().mockReturnValue({
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

const cacheManagerMock = {
  get: jest.fn(),
  set: jest.fn(),
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
        { provide: GroupsService, useValue: mockGroupsService },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
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
        lean: jest.fn().mockResolvedValue([mockUser]),
      } as unknown as any);

      const user = await service.findOne('testuser');

      expect(user).toEqual([mockUser]);
      expect(model.findOne).toHaveBeenCalledWith({ username: 'testuser' }, USER_DB_PROJECTION);
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
      cacheManagerMock.get.mockResolvedValue(cachedUsersBySchool);

      const result = await service.findAllCachedUsers(mockToken, 'agy');
      expect(result).toEqual(cachedUsersBySchool);
      expect(cacheManagerMock.get).toHaveBeenCalledWith('allUsersBySchool');
    });

    it('should fetch users from external API if not cached', async () => {
      cacheManagerMock.get.mockResolvedValue(null);
      mockGroupsService.fetchAllUsers.mockResolvedValue(fetchedUsersBySchool);

      const result = await service.findAllCachedUsers(mockToken, 'agy');
      expect(result).toEqual(fetchedUsersBySchool);
      expect(GroupsService.fetchAllUsers).toHaveBeenCalledWith(mockToken);
      expect(cacheManagerMock.set).toHaveBeenCalledWith('allUsersBySchool', fetchedUsersBySchool, DEFAULT_CACHE_TTL_MS);
    });
  });

  describe('searchUsersByName', () => {
    it('should return users matching the search string', async () => {
      const ldapUsers: LDAPUser[] = [
        {
          id: '1',
          username: 'cacheduser',
          firstName: 'Cached',
          lastName: 'User',
          email: 'cacheduser@example.com',
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
        {
          id: '3',
          username: 'john',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
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

      jest.spyOn(service, 'findAllCachedUsers').mockResolvedValue({ agy: ldapUsers });

      const result = await service.searchUsersByName(mockToken, 'agy', 'john');
      expect(result).toEqual([{ username: 'john', firstName: 'John', lastName: 'Doe' }]);
      expect(service.findAllCachedUsers).toHaveBeenCalledWith(mockToken, 'agy');
    });
  });

  describe('getPassword', () => {
    it("should return the user's password", async () => {
      const userData = { password: 'password', encryptKey: 'encryptKey' };
      model.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(userData),
      });
      const user = await service.getPassword('testuser');

      expect(user).toEqual(getDecryptedPassword('password', 'encryptKey'));
      expect(model.findOne).toHaveBeenCalledWith({ username: 'testuser' }, 'password encryptKey');
    });
  });
});
