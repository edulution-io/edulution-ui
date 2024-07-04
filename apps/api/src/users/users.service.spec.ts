/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';
import { LDAPUser } from '@libs/user/types/groups/ldapUser';
import { User, UserDocument } from './user.schema';
import UsersService from './users.service';
import CreateUserDto from './dto/create-user.dto';
import UpdateUserDto from './dto/update-user.dto';
import RegisterUserDto from './dto/register-user.dto';
import DEFAULT_CACHE_TTL_MS from '../app/cache-ttl';
import GroupsService from '../groups/groups.service';
import mockGroupsService from '../groups/groups.service.mock';

jest.mock('axios');
const mockToken = 'token';

const mockUser = {
  email: 'test@example.com',
  username: 'testuser',
  roles: ['user'],
};
const cachedUsers: LDAPUser[] = [
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

const fetchedUsers: LDAPUser[] = [
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
    exec: jest.fn().mockResolvedValue([mockUser]),
  }),
  findOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockUser),
  }),
  findOneAndUpdate: jest.fn().mockReturnValue({
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

describe(UsersService.name, () => {
  let service: UsersService;
  let model: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register({
          ttl: DEFAULT_CACHE_TTL_MS,
        }),
      ],
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user if not existing', async () => {
      const userDto = new RegisterUserDto();
      userDto.preferred_username = 'testuser';
      userDto.email = 'test@example.com';
      userDto.ldapGroups = ['group1'];
      userDto.password = 'password';

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(model, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as unknown as Query<any, any>);

      await service.register(userDto);

      expect(model.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(model.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password',
        roles: ['group1'],
      });
    });

    it('should update existing user', async () => {
      const userDto = new RegisterUserDto();
      userDto.preferred_username = 'testuser';
      userDto.ldapGroups = ['group1'];
      userDto.password = 'password';

      await service.register(userDto);
      expect(model.findOne).toHaveBeenCalled();
      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { username: 'testuser' },
        { roles: ['group1'], password: 'password' }, // Ensure password is included here
        { new: true },
      );
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = new CreateUserDto();
      createUserDto.email = 'test@example.com';
      createUserDto.username = 'testuser';
      createUserDto.roles = ['user'];
      createUserDto.password = 'password';

      const newUser = await service.create(createUserDto);
      expect(newUser).toEqual(mockUser);
      expect(model.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = await service.findAll();
      expect(users).toEqual([mockUser]);
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const user = await service.findOne('testuser');
      expect(user).toEqual(mockUser);
      expect(model.findOne).toHaveBeenCalledWith({ username: 'testuser' });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = new UpdateUserDto();
      updateUserDto.email = 'updated@example.com';
      updateUserDto.password = 'password';

      await service.update('testuser', updateUserDto);

      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { username: 'testuser' },
        expect.objectContaining({
          email: 'updated@example.com',
          password: 'password',
        }),
        { new: true },
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
      cacheManagerMock.get.mockResolvedValue(cachedUsers);

      const result = await service.findAllCachedUsers(mockToken);
      expect(result).toEqual(cachedUsers);
      expect(cacheManagerMock.get).toHaveBeenCalledWith('allUsers');
    });

    it('should fetch users from external API if not cached', async () => {
      cacheManagerMock.get.mockResolvedValue(null);
      mockGroupsService.fetchUsers.mockResolvedValue(fetchedUsers);

      const result = await service.findAllCachedUsers(mockToken);
      expect(result).toEqual(fetchedUsers);
      expect(mockGroupsService.fetchUsers).toHaveBeenCalledWith(mockToken);
      expect(cacheManagerMock.set).toHaveBeenCalledWith('allUsers', fetchedUsers, DEFAULT_CACHE_TTL_MS);
    });
  });

  describe('searchUsersByName', () => {
    it('should return users matching the search string', async () => {
      const ldapUsers: LDAPUser[] = [
        ...cachedUsers,
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
      jest.spyOn(service, 'findAllCachedUsers').mockResolvedValue(ldapUsers);

      const result = await service.searchUsersByName(mockToken, 'john');
      expect(result).toEqual([{ username: 'john', firstName: 'John', lastName: 'Doe' }]);
      expect(service.findAllCachedUsers).toHaveBeenCalledWith(mockToken);
    });
  });
});
