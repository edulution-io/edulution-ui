import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {HttpStatus, Inject, Injectable} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LDAPUser } from '@libs/user/types/groups/ldapUser';
import UserDto from '@libs/user/types/user.dto';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/contants/common-error-messages';
import UserErrorMessages from '@libs/user/user-error-messages';
import CreateUserDto from './dto/create-user.dto';
import UpdateUserDto from './dto/update-user.dto';
import { User, UserDocument } from './user.schema';
import DEFAULT_CACHE_TTL_MS from '../app/cache-ttl';
import GroupsService from '../groups/groups.service';
import { getDecryptedPassword } from '@libs/common/utils';

@Injectable()
class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly groupsService: GroupsService,
  ) {}

  async createOrUpdate(userDto: UserDto): Promise<User | null> {
    const existingUser = await this.userModel.findOne<User>({ username: userDto.username }).exec();

    let newUser;
    if (!existingUser) {
      newUser = await this.create({
        email: userDto.email,
        username: userDto.username,
        password: userDto.password,
        ldapGroups: userDto.ldapGroups,
      });
    } else {
      newUser = await this.update(userDto.username, {
        password: userDto.password,
        ldapGroups: userDto.ldapGroups,
      });
    }

    return newUser;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userModel.create(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(username: string): Promise<User | null> {
    return this.userModel.findOne<User>({ username }).exec();
  }

  async update(username: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel.findOneAndUpdate<User>({ username }, updateUserDto, { new: true }).exec();
  }

  async remove(username: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ username }).exec();
    return result.deletedCount > 0;
  }

  async findAllCachedUsers(token: string): Promise<LDAPUser[]> {
    const cachedUsers = await this.cacheManager.get<LDAPUser[]>('allUsers');
    if (cachedUsers) {
      return cachedUsers;
    }

    const fetchedUsers = await this.groupsService.fetchUsers(token);

    await this.cacheManager.set('allUsers', fetchedUsers, DEFAULT_CACHE_TTL_MS);
    return fetchedUsers;
  }

  async searchUsersByName(token: string, name: string): Promise<User[]> {
    const searchString = name.toLowerCase();
    const users = await this.findAllCachedUsers(token);

    return users
      .filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchString) ||
          user.lastName?.toLowerCase().includes(searchString) ||
          user.username?.toLowerCase().includes(searchString),
      )
      .map((u) => ({ firstName: u.firstName, lastName: u.lastName, username: u.username }));
  }

  async getPassword(username: string): Promise<string> {
    const { EDUI_ENCRYPTION_KEY } = process.env;

    if (!EDUI_ENCRYPTION_KEY) {
      throw new CustomHttpException(
        CommonErrorMessages.NotAbleToReadEnvironmentVariablesError,
        HttpStatus.FAILED_DEPENDENCY,
      );
    }

    const existingUser = await this.userModel.findOne({ username: username });
    if (!existingUser) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToGetUserError, HttpStatus.NOT_FOUND);
    }
    if (!existingUser.password) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToGetUserPasswordError, HttpStatus.NOT_FOUND);
    }

    let decryptedPassword = '';
    try {
      decryptedPassword = getDecryptedPassword(existingUser.password, EDUI_ENCRYPTION_KEY);
    } catch (error) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToDecryptPasswordError, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return decryptedPassword;
  }
}

export default UsersService;
