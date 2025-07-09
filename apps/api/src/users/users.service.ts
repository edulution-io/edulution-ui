/* eslint-disable no-underscore-dangle */
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

import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { getDecryptedPassword } from '@libs/common/utils';
import { DEFAULT_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import UserErrorMessages from '@libs/user/constants/user-error-messages';
import { LDAPUser } from '@libs/groups/types/ldapUser';
import UserDto from '@libs/user/types/user.dto';
import USER_DB_PROJECTION from '@libs/user/constants/user-db-projection';
import SPECIAL_SCHOOLS from '@libs/common/constants/specialSchools';
import { ALL_USERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import type UserAccountDto from '@libs/user/types/userAccount.dto';
import type CachedUser from '@libs/user/types/cachedUser';
import CustomHttpException from '../common/CustomHttpException';
import UpdateUserDto from './dto/update-user.dto';
import { User, UserDocument } from './user.schema';
import GroupsService from '../groups/groups.service';
import { UserAccounts, UserAccountsDocument } from './account.schema';

@Injectable()
class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserAccounts.name) private userAccountModel: Model<UserAccountsDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly groupsService: GroupsService,
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
    return this.userModel.findOne({ username }).select(USER_DB_PROJECTION).lean();
  }

  async update(username: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel.findOneAndUpdate<User>({ username }, updateUserDto, { new: true }).exec();
  }

  async remove(username: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ username }).exec();
    return result.deletedCount > 0;
  }

  async findAllCachedUsers(schoolName: string): Promise<CachedUser[]> {
    const mapToCachedUser = (user: LDAPUser): CachedUser => ({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      school: user.attributes.school?.[0] || SPECIAL_SCHOOLS.GLOBAL,
    });

    const cacheKey = ALL_USERS_CACHE_KEY + schoolName;
    const cachedUsers = await this.cacheManager.get<CachedUser[]>(cacheKey);

    if (cachedUsers) {
      return cachedUsers;
    }

    const fetchedUsers = await this.groupsService.fetchAllUsers();
    const cachedUserList: CachedUser[] = fetchedUsers.map(mapToCachedUser);

    const usersBySchool = cachedUserList.reduce(
      (acc, user) => {
        const userSchool = user.school;
        if (userSchool) {
          if (!acc[userSchool]) {
            acc[userSchool] = [];
          }
          acc[userSchool].push(user);
        }
        return acc;
      },
      {} as Record<string, CachedUser[]>,
    );

    await Promise.all(
      Object.entries(usersBySchool).map(async ([school, userList]) => {
        const key = ALL_USERS_CACHE_KEY + school;
        await this.cacheManager.set(key, userList, DEFAULT_CACHE_TTL_MS);
      }),
    );

    await this.cacheManager.set(ALL_USERS_CACHE_KEY + SPECIAL_SCHOOLS.GLOBAL, cachedUserList, DEFAULT_CACHE_TTL_MS);

    return usersBySchool[schoolName] ?? [];
  }

  async searchUsersByName(schoolName: string, name: string): Promise<CachedUser[]> {
    const searchString = name.toLowerCase();

    const users = await this.findAllCachedUsers(schoolName);

    return users.filter(
      (user) =>
        user.firstName?.toLowerCase().includes(searchString) ||
        user.lastName?.toLowerCase().includes(searchString) ||
        user.username?.toLowerCase().includes(searchString),
    );
  }

  async getPassword(username: string): Promise<string> {
    const existingUser = await this.userModel.findOne({ username }, 'password encryptKey').lean();
    if (!existingUser || !existingUser.password) {
      throw new CustomHttpException(
        UserErrorMessages.NotFoundError,
        HttpStatus.NOT_FOUND,
        undefined,
        UsersService.name,
      );
    }

    return getDecryptedPassword(existingUser.password, existingUser.encryptKey);
  }

  async addUserAccount(username: string, userAccountDto: Omit<UserAccountDto, 'accountId'>): Promise<UserAccountDto[]> {
    try {
      const user = await this.userModel.findOne({ username }, '_id').exec();

      if (!user) {
        throw new CustomHttpException(
          UserErrorMessages.NotFoundError,
          HttpStatus.NOT_FOUND,
          undefined,
          UsersService.name,
        );
      }

      const isCreated = await this.userAccountModel.create({
        ...userAccountDto,
        userId: user._id,
      });

      if (!isCreated) {
        throw new CustomHttpException(
          UserErrorMessages.UpdateError,
          HttpStatus.NOT_MODIFIED,
          undefined,
          UsersService.name,
        );
      }

      const userAccounts = await this.getUserAccounts(username);

      return userAccounts;
    } catch (error) {
      throw new CustomHttpException(
        UserErrorMessages.UpdateError,
        HttpStatus.NOT_MODIFIED,
        undefined,
        UsersService.name,
      );
    }
  }

  async getUserAccounts(username: string): Promise<UserAccountDto[]> {
    try {
      const user = await this.userModel.findOne({ username }, '_id').exec();

      if (!user) {
        throw new CustomHttpException(
          UserErrorMessages.NotFoundError,
          HttpStatus.NOT_FOUND,
          undefined,
          UsersService.name,
        );
      }

      const userAccounts = await this.userAccountModel
        .find({ userId: user._id }, 'appName accountUser accountPassword')
        .exec();

      const userAccountsDto = userAccounts.map((account) => ({
        accountId: account._id as string,
        appName: account.appName,
        accountUser: account.accountUser,
        accountPassword: account.accountPassword,
      }));

      return userAccountsDto;
    } catch (error) {
      throw new CustomHttpException(
        UserErrorMessages.NotFoundError,
        HttpStatus.NOT_FOUND,
        undefined,
        UsersService.name,
      );
    }
  }

  async updateUserAccount(
    username: string,
    accountId: string,
    userAccountDto: UserAccountDto,
  ): Promise<UserAccountDto[]> {
    try {
      await this.userAccountModel
        .findOneAndUpdate(
          { _id: accountId },
          {
            $set: {
              appName: userAccountDto.appName,
              accountUser: userAccountDto.accountUser,
              accountPassword: userAccountDto.accountPassword,
            },
          },
        )
        .exec();

      const userAccounts = await this.getUserAccounts(username);

      return userAccounts;
    } catch (error) {
      throw new CustomHttpException(
        UserErrorMessages.UpdateError,
        HttpStatus.NOT_MODIFIED,
        undefined,
        UsersService.name,
      );
    }
  }

  async deleteUserAccount(username: string, accountId: string): Promise<UserAccountDto[]> {
    try {
      const isDeleted = await this.userAccountModel.deleteOne({ _id: accountId }).exec();

      if (!isDeleted) {
        throw new CustomHttpException(
          UserErrorMessages.UpdateError,
          HttpStatus.NOT_MODIFIED,
          undefined,
          UsersService.name,
        );
      }

      const userAccounts = await this.getUserAccounts(username);

      return userAccounts;
    } catch (error) {
      throw new CustomHttpException(
        UserErrorMessages.UpdateError,
        HttpStatus.NOT_MODIFIED,
        undefined,
        UsersService.name,
      );
    }
  }
}

export default UsersService;
