import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../users/user.schema';
import UpdateUserDto from '../../users/dto/update-user.dto';

@Injectable()
class UsersPollsService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async updateUser(username: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel.findOneAndUpdate<User>({ username }, updateUserDto, { new: true }).exec();
  }

  async getOpenPollNames(username: string): Promise<string[]> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    return existingUser.usersPolls?.openPolls || [];
  }

  async getCreatedPollNames(username: string): Promise<string[]> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    return existingUser.usersPolls?.createdPolls || [];
  }

  async getAnsweredPollNames(username: string): Promise<string[]> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    return existingUser.usersPolls?.answeredPolls || [];
  }

  async removeFromOpenPolls(userName: string, pollName: string): Promise<void> {
    const existingUser = await this.userModel.findOne<User>({ username: userName }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    const index = existingUser.usersPolls?.openPolls?.indexOf(pollName);
    if (!index || index === -1) {
      throw new Error('Poll not found');
    }

    const usersOpenPolls = existingUser.usersPolls?.openPolls?.splice(index, 1);
    const newUser = {
      ...existingUser,
      usersPolls: {
        ...existingUser.usersPolls,
        openPolls: usersOpenPolls,
      },
    };

    await this.updateUser(userName, newUser);
  }

  async addToOpenPolls(userName: string, pollName: string): Promise<void> {
    const existingUser = await this.userModel.findOne<User>({ username: userName }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    const usersOpenPolls = existingUser.usersPolls?.openPolls || [];
    usersOpenPolls.push(pollName);

    const newUser: UpdateUserDto = {
      usersPolls: {
        createdPolls: [...(existingUser.usersPolls?.createdPolls || [])],
        openPolls: [...usersOpenPolls],
        answeredPolls: [...(existingUser.usersPolls?.answeredPolls || [])],
      },
    };

    await this.updateUser(userName, newUser);
  }

  async addToCreatedPolls(userName: string, pollName: string): Promise<User | null> {
    const existingUser = await this.userModel.findOne<User>({ username: userName }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    const usersCreatedPolls = existingUser.usersPolls?.createdPolls || [];
    usersCreatedPolls.push(pollName);

    const newUser: UpdateUserDto = {
      usersPolls: {
        createdPolls: [...usersCreatedPolls],
        openPolls: [...(existingUser.usersPolls?.openPolls || [])],
        answeredPolls: [...(existingUser.usersPolls?.answeredPolls || [])],
      },
    };

    const updatedUser = await this.updateUser(userName, newUser);
    return updatedUser;
  }

  async addToAnsweredPolls(userName: string, pollName: string): Promise<User | null> {
    const existingUser = await this.userModel.findOne<User>({ username: userName }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    const usersAnsweredPolls = existingUser.usersPolls?.answeredPolls || [];
    usersAnsweredPolls.push(pollName);

    const newUser: UpdateUserDto = {
      usersPolls: {
        createdPolls: [...(existingUser.usersPolls?.createdPolls || [])],
        openPolls: [...(existingUser.usersPolls?.openPolls || [])],
        answeredPolls: [...usersAnsweredPolls],
      },
    };

    const updatedUser = await this.updateUser(userName, newUser);
    return updatedUser;
  }

  async populatePoll(participants: string[], pollName: string): Promise<void> {
    const promises: Promise<void>[] = [];
    participants.forEach((username: string) => {
      promises.push(this.addToOpenPolls(username, pollName));
    });
    await Promise.all(promises);
  }
}

export default UsersPollsService;
