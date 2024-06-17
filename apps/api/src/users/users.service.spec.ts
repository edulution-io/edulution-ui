/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';
import { User, UserDocument } from './user.schema';
import UsersService from './users.service';
import CreateUserDto from './dto/create-user.dto';
import UpdateUserDto from './dto/update-user.dto';
import RegisterUserDto from './dto/register-user.dto';
import DEFAULT_CACHE_TTL_MS from '../app/cache-ttl';

const mockUser = {
  email: 'test@example.com',
  username: 'testuser',
  roles: ['user'],
};

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
    exec: jest.fn().mockResolvedValue(true),
  }),
};

describe('UsersService', () => {
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(model, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as unknown as Query<any, any>);
      await service.register(userDto);

      expect(model.findOne).toHaveBeenCalled();
      expect(model.create).toHaveBeenCalledWith(userDto);
    });

    it('should update existing user', async () => {
      await service.register(new RegisterUserDto());
      expect(model.findOne).toHaveBeenCalled();
      expect(model.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = new CreateUserDto();
      createUserDto.email = 'test@example.com';
      createUserDto.username = 'testuser';
      createUserDto.roles = ['user'];

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
      expect(model.findOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updatedUser = await service.update('testuser', new UpdateUserDto());
      expect(updatedUser).toEqual(mockUser);
      expect(model.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.remove('testuser');
      expect(result).toBeTruthy();
      expect(model.deleteOne).toHaveBeenCalled();
    });
  });
});
