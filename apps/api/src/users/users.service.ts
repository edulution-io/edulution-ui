import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import CreateUserDto from './dto/create-user.dto';
import UpdateUserDto from './dto/update-user.dto';
import { User, UserDocument } from './user.schema';
import LoginUserDto from './dto/login-user.dto';

@Injectable()
class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async login(loginUserDto: LoginUserDto): Promise<User | null> {
    const existingUser = await this.userModel.findOne<User>({ username: loginUserDto.preferred_username }).exec();

    let newUser;
    if (!existingUser) {
      newUser = await this.create({
        email: loginUserDto.email,
        username: loginUserDto.preferred_username,
        roles: loginUserDto.ldapGroups,
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
}

export default UsersService;
