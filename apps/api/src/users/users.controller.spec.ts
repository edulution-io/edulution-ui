/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import UserDto from '@libs/user/types/user.dto';
import LdapGroups from '@libs/groups/types/ldapGroups';
import { UsersController } from './users.controller';
import UsersService from './users.service';
import { User } from './user.schema';
import UpdateUserDto from './dto/update-user.dto';

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
      const token = 'testtoken';
      const searchString = 'test';
      const school = 'testschool';
      await controller.search(token, searchString, school);
      expect(service.searchUsersByName).toHaveBeenCalledWith(token, school, searchString);
    });
  });
});
