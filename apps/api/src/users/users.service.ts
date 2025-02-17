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
import CustomHttpException from '@libs/error/CustomHttpException';
import UserErrorMessages from '@libs/user/constants/user-error-messages';
import { LDAPUser } from '@libs/groups/types/ldapUser';
import UserDto from '@libs/user/types/user.dto';
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

  async update(username: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel.findOneAndUpdate<User>({ username }, updateUserDto, { new: true }).exec();
  }

  async remove(username: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ username }).exec();
    return result.deletedCount > 0;
  }

  async findAllCachedUsers(token: string, school: string): Promise<Record<string, LDAPUser[]>> {
    const cachedUsers = await this.cacheManager.get<Record<string, LDAPUser[]>>('allUsersBySchool');

    if (cachedUsers && cachedUsers[school]) {
      return { [school]: cachedUsers[school] };
    }

    const fetchedUsers = await GroupsService.fetchAllUsers(token);

    const usersBySchool = fetchedUsers.reduce(
      (acc, user) => {
        const userSchool = user.attributes.school?.[0];
        if (userSchool) {
          if (!acc[userSchool]) {
            acc[userSchool] = [];
          }
          acc[userSchool].push(user);
        }
        return acc;
      },
      {} as Record<string, LDAPUser[]>,
    );

    await this.cacheManager.set('allUsersBySchool', usersBySchool);
    return { [school]: usersBySchool[school] || [] };
  }

  async searchUsersByName(token: string, school: string, name: string): Promise<Partial<User>[]> {
    const searchString = name.toLowerCase();
    const usersBySchool = await this.findAllCachedUsers(token, school);
    const users = usersBySchool[school] || [];

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
    const existingUser = await this.userModel.findOne({ username }, 'password encryptKey').lean();
    if (!existingUser || !existingUser.password) {
      throw new CustomHttpException(UserErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);
    }

    return getDecryptedPassword(existingUser.password, existingUser.encryptKey);
  }
}

export default UsersService;
