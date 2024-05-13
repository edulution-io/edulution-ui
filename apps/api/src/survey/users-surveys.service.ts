import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';
import UpdateUserDto from '../users/dto/update-user.dto';
import { Survey } from './survey.schema';

@Injectable()
class UsersSurveysService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async updateUser(username: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel.findOneAndUpdate<User>({ username }, updateUserDto, { new: true }).exec();
  }

  async getOpenSurveys(username: string): Promise<string[]> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    return existingUser.UsersSurveys.openSurveys;
  }

  async getCreatedSurveys(username: string): Promise<Survey[]> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    return existingUser.UsersSurveys.createdSurveys;
  }

  async removeFromOpenSurveys(username: string, surveyName: string): Promise<void> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    const index = existingUser.UsersSurveys.openSurveys.indexOf(surveyName);
    if (index === -1) {
      throw new Error('Survey not found');
    }

    const usersOpenSurveys = existingUser.UsersSurveys.openSurveys.splice(index, 1);
    const newUser = {
      ...existingUser,
      UsersSurveys: {
        ...existingUser.UsersSurveys,
        openSurveys: usersOpenSurveys,
      },
    };

    await this.updateUser(username, newUser);
  }

  async addToOpenSurveys(username: string, surveyname: string): Promise<void> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    const usersOpenSurveys = existingUser.UsersSurveys.openSurveys;
    usersOpenSurveys.push(surveyname);

    const newUser = {
      ...existingUser,
      surveys: {
        ...existingUser.UsersSurveys,
        openSurveys: usersOpenSurveys,
      },
    };

    await this.updateUser(username, newUser);
  }

  async populateSurvey(participants: string[], surveyName: string): Promise<void> {
    const promises: Promise<void>[] = [];
    participants.forEach((username: string) => {
      promises.push(this.addToOpenSurveys(username, surveyName));
    });
    await Promise.all(promises);
  }

  async addAnswer(username: string, surveyName: string, answer: JSON): Promise<void> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    const usersAnsweredSurveys = existingUser.UsersSurveys.answeredSurveys;
    usersAnsweredSurveys.push({ surveyname: surveyName, answer });

    const newUser = {
      ...existingUser,
      surveys: {
        ...existingUser.UsersSurveys,
        answeredSurveys: usersAnsweredSurveys,
      },
    };

    await this.updateUser(username, newUser);

    await this.removeFromOpenSurveys(username, surveyName);
  }

  async changeAnswer(username: string, surveyName: string, newAnswer: JSON): Promise<void> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    const usersAnsweredSurveys = existingUser.UsersSurveys.answeredSurveys.map((answer) =>
      answer.surveyname === surveyName ? { surveyname: surveyName, answer: newAnswer } : answer,
    );

    const index = usersAnsweredSurveys.findIndex((answer) => answer.surveyname === surveyName);
    usersAnsweredSurveys[index] = { surveyname: surveyName, answer: newAnswer };

    const newUser = {
      ...existingUser,
      surveys: {
        ...existingUser.UsersSurveys,
        answeredSurveys: usersAnsweredSurveys,
      },
    };
    await this.updateUser(username, newUser);
  }

  async getAnswer(
    username: string,
    surveyName: string,
    isAnonymous: boolean,
  ): Promise<{ surveyname: string; answer: JSON | string }> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    const usersAnsweredSurveys = existingUser.UsersSurveys.answeredSurveys;
    const answer = usersAnsweredSurveys.find((a) => a.surveyname === surveyName);

    const name = isAnonymous ? Math.random().toString() : username;
    const result = answer ? answer.answer : 'Not answered yet';

    return { surveyname: name, answer: result };
  }
}

export default UsersSurveysService;
