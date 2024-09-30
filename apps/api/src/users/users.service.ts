import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { getDecryptedPassword } from '@libs/common/utils';
import CustomHttpException from '@libs/error/CustomHttpException';
import UserErrorMessages from '@libs/user/constants/user-error-messages';
import { LDAPUser } from '@libs/groups/types/ldapUser';
import UserDto from '@libs/user/types/user.dto';
import { DEFAULT_CACHE_TTL_MS } from '@libs/common/contants/cacheTtl';
import USER_DB_PROJECTION from '@libs/user/constants/user-db-projections';
import UpdateUserDto from './dto/update-user.dto';
import { User, UserDocument } from './user.schema';
import GroupsService from '../groups/groups.service';

@Injectable()
class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createOrUpdate(userDto: UserDto): Promise<User | null> {
    return this.userModel
      .findOneAndUpdate(
        { username: userDto.username },
        {
          $set: {
            email: userDto.email,
            firstName: userDto.firstName,
            lastName: userDto.lastName,
            password: userDto.password,
            encryptKey: userDto.encryptKey,
            ldapGroups: userDto.ldapGroups,
          },
        },
        { new: true, upsert: true, projection: USER_DB_PROJECTION },
      )
      .lean();
  }

  async findOne(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }, USER_DB_PROJECTION).lean();
  }

  async findOneKey(username: string): Promise<string> {
    const user = await this.userModel.findOne({ username }, 'password').lean();
    if (!user) {
      throw new CustomHttpException(UserErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);
    }
    return user.password;
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

    const fetchedUsers = await GroupsService.fetchAllUsers(token);

    await this.cacheManager.set('allUsers', fetchedUsers, DEFAULT_CACHE_TTL_MS);
    return fetchedUsers;
  }

  async searchUsersByName(token: string, name: string): Promise<Partial<User>[]> {
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
    const existingUser = await this.userModel.findOne({ username });
    if (!existingUser || !existingUser.password) {
      throw new CustomHttpException(UserErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);
    }

    return getDecryptedPassword(existingUser.password, existingUser.encryptKey);
  }
}

export default UsersService;
