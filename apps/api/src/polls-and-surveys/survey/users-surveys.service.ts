import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../users/user.schema';
import UpdateUserDto from '../../users/dto/update-user.dto';
import { SurveyAnswer } from './types/users-surveys.schema';

@Injectable()
class UsersSurveysService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async updateUser(username: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel.findOneAndUpdate<User>({ username }, updateUserDto, { new: true }).exec();
  }

  async getOpenSurveyNames(username: string): Promise<string[]> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    return existingUser.usersSurveys?.openSurveys || [];
  }

  async getCreatedSurveyNames(username: string): Promise<string[]> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    return existingUser.usersSurveys?.createdSurveys || [];
  }

  async getAnswers(username: string): Promise<SurveyAnswer[]> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    return existingUser.usersSurveys?.answeredSurveys || [];
  }

  async addToOpenSurveys(username: string, surveyname: string): Promise<void> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    const usersOpenSurveys = existingUser.usersSurveys?.openSurveys || [];
    usersOpenSurveys.push(surveyname);

    const newUser: UpdateUserDto = {
      usersSurveys: {
        ...existingUser.usersSurveys,
        openSurveys: [...usersOpenSurveys],
      },
    };

    await this.updateUser(username, newUser);
  }

  async addToCreatedSurveys(username: string, surveyname: string): Promise<User | null> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    const usersCreatedSurveys = existingUser.usersSurveys?.createdSurveys || [];
    usersCreatedSurveys.push(surveyname);

    const newUser: UpdateUserDto = {
      usersSurveys: {
        ...existingUser.usersSurveys,
        createdSurveys: [...usersCreatedSurveys],
      },
    };

    const updatedUser = await this.updateUser(username, newUser);
    return updatedUser;
  }

  async populateSurvey(participants: string[], surveyName: string): Promise<void> {
    const promises: Promise<void>[] = [];
    participants.forEach((username: string) => {
      promises.push(this.addToOpenSurveys(username, surveyName));
    });
    await Promise.all(promises);
  }

  // async onRemoveSurvey(surveyName: string): Promise<void> {
  //   const existingUsers = await this.userModel.find<User>().exec();
  //
  //   const promises = existingUsers.map(async (user) => {
  //     const {
  //       createdSurveys = [],
  //       openSurveys = [],
  //       answeredSurveys = [],
  //       ...remainingUserSurveys
  //     } = user.usersSurveys;
  //
  //     const usersCreatedSurveys = createdSurveys.filter((survey) => survey !== surveyName) || [];
  //     const usersOpenSurveys = openSurveys.filter((survey) => survey !== surveyName) || [];
  //     const usersAnsweredSurveys = answeredSurveys.filter((surveyAnswer) => surveyAnswer.surveyname !== surveyName) || [];
  //
  //     const newUser: UpdateUserDto = {
  //       usersSurveys: {
  //         ...remainingUserSurveys,
  //         createdSurveys: [...usersCreatedSurveys],
  //         openSurveys: [...usersOpenSurveys],
  //         answeredSurveys: [...usersAnsweredSurveys],
  //       },
  //     };
  //
  //     return await this.updateUser(user.username, newUser);
  //   });
  //
  //   await Promise.all(promises);
  // }

  async addAnswer(username: string, surveyName: string, answer: string): Promise<User | null> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    const usersOpenSurveys = existingUser.usersSurveys?.openSurveys.filter((survey) => survey !== surveyName) || [];

    const usersAnsweredSurveys =
      existingUser.usersSurveys?.answeredSurveys.filter((surveyAnswer) => surveyAnswer.surveyname !== surveyName) || [];
    usersAnsweredSurveys.push({ surveyname: surveyName, answer });

    const newUser: UpdateUserDto = {
      usersSurveys: {
        ...existingUser.usersSurveys,
        openSurveys: [...usersOpenSurveys],
        answeredSurveys: [...usersAnsweredSurveys],
      },
    };

    const updatedUser = await this.updateUser(username, newUser);

    return updatedUser;
  }

  async getAnswer(username: string, surveyName: string): Promise<string | undefined> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    const answeredSurvey =
      existingUser.usersSurveys?.answeredSurveys.find((answer) => answer.surveyname === surveyName) || undefined;
    return answeredSurvey?.answer;
  }
}

export default UsersSurveysService;
