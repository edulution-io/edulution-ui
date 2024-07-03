import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { LDAPUser } from '@libs/user/types/groups/ldapUser';
import CreateUserDto from './dto/create-user.dto';
import UpdateUserDto from './dto/update-user.dto';
import { User, UserDocument } from './user.schema';
import RegisterUserDto from './dto/register-user.dto';
import DEFAULT_CACHE_TTL_MS from '../app/cache-ttl';
import GroupsService from '../groups/groups.service';

@Injectable()
class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly groupsService: GroupsService,
  ) {}

  async register(userDto: RegisterUserDto): Promise<User | null> {
    const existingUser = await this.userModel.findOne<User>({ username: userDto.preferred_username }).exec();

    let newUser;
    if (!existingUser) {
      newUser = await this.create({
        email: userDto.email,
        username: userDto.preferred_username,
        roles: userDto.ldapGroups,
      });
    } else {
      newUser = await this.update(userDto.preferred_username, {
        roles: userDto.ldapGroups,
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
}

export default UsersService;
