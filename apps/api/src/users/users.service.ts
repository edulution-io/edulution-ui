import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import axios from 'axios';
import CreateUserDto from './dto/create-user.dto';
import UpdateUserDto from './dto/update-user.dto';
import { User, UserDocument } from './user.schema';
import LoginUserDto from './dto/login-user.dto';
import { LDAPUser } from '../types/ldapUser';

const { KEYCLOAK_API } = process.env;

@Injectable()
class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async login(loginUserDto: LoginUserDto): Promise<User | null> {
    const existingUser = await this.userModel.findOne<User>({ username: loginUserDto.preferred_username }).exec();

    let newUser;
    if (!existingUser) {
      newUser = await this.create({
        email: loginUserDto.email,
        username: loginUserDto.preferred_username,
        roles: loginUserDto.ldapGroups,
        mfaEnabled: false,
        isTotpSet: false,
      });
    } else {
      newUser = await this.update(loginUserDto.preferred_username, {
        roles: loginUserDto.ldapGroups,
      });
    }

    return newUser;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = await this.userModel.create(createUserDto);
    return newUser;
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

  async remove(username: string): Promise<any> {
    return this.userModel.deleteOne({ username }).exec();
  }

  async findAllCachedUsers(token: string): Promise<LDAPUser[]> {
    const cachedUsers = await this.cacheManager.get<LDAPUser[]>('allUsers');
    if (cachedUsers) {
      return cachedUsers;
    }

    const fetchedUsers = await UsersService.fetchUsersFromExternalApi(token);

    await this.cacheManager.set('allUsers', fetchedUsers, 300000);
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

  private static async fetchUsersFromExternalApi(token: string): Promise<LDAPUser[]> {
    const config = {
      method: 'get',
      url: `${KEYCLOAK_API}users`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.request<LDAPUser[]>(config);

      return response.data;
    } catch (e) {
      Logger.error(e, UsersService.name);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}

export default UsersService;