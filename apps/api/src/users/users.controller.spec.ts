/* eslint-disable @typescript-eslint/unbound-method */
import { CacheModule } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import UsersService from './users.service';
import { User } from './user.schema';
import DEFAULT_CACHE_TTL_MS from '../app/cache-ttl';
import CreateUserDto from './dto/create-user.dto';
import RegisterUserDto from './dto/register-user.dto';
import UpdateUserDto from './dto/update-user.dto';

const mockUserModel = {
  insertMany: jest.fn(),
  bulkWrite: jest.fn(),
  find: jest.fn(),
  deleteOne: jest.fn(),
};

const mockUsersService = {
  register: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  searchUsersByName: jest.fn(),
};

describe(UsersController.name, () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register({
          ttl: DEFAULT_CACHE_TTL_MS,
        }),
      ],
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

  describe('register', () => {
    it('should call register method of usersService with correct arguments', async () => {
      const registerDto: RegisterUserDto = {
        preferred_username: 'testuser',
        email: 'test@example.com',
        ldapGroups: ['group1'],
      };
      await controller.register(registerDto);
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('create', () => {
    it('should call create method of usersService with correct arguments', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        roles: ['role1'],
      };
      await controller.create(createUserDto);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should call findAll method of usersService', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call findOne method of usersService with correct arguments', async () => {
      const username = 'testuser';
      await controller.findOne(username);
      expect(service.findOne).toHaveBeenCalledWith(username);
    });
  });

  describe('update', () => {
    it('should call update method of usersService with correct arguments', async () => {
      const username = 'testuser';
      const updateUserDto: UpdateUserDto = {
        username: 'updatedUser',
        email: 'updated@example.com',
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
      await controller.search(token, searchString);
      expect(service.searchUsersByName).toHaveBeenCalledWith(token, searchString);
    });
  });
});
