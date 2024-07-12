import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/user.schema';
import { Attendee } from '../conferences/dto/attendee';
import UpdateUserDto from '../users/dto/update-user.dto';
import { SurveyAnswer } from './types/survey-answer';
import { UserNotFoundError } from './errors/user-not-found-error.ts';

@Injectable()
class UsersSurveysService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async updateUser(participant: Attendee | string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const name = typeof participant === 'string' ? participant : participant.username;
    const newUser = await this.userModel
      .findOneAndUpdate<User>({ username: name }, updateUserDto, { new: true })
      .exec();
    if (!newUser) {
      throw new Error('User did not update');
    }
    return newUser;
  }

  async getExistingUser(participant: Attendee | string): Promise<User | null> {
    const name = typeof participant === 'string' ? participant : participant.username;
    const existingUser = await this.userModel.findOne<User>({ username: name }).exec();
    if (!existingUser) {
      throw UserNotFoundError;
    }
    return existingUser;
  }

  async getOpenSurveyIds(username: string): Promise<number[]> {
    const user = await this.getExistingUser(username);
    return user?.usersSurveys?.openSurveys || [];
  }

  async getCreatedSurveyIds(username: string): Promise<number[]> {
    const user = await this.getExistingUser(username);
    return user?.usersSurveys?.createdSurveys || [];
  }

  async getAnsweredSurveyIds(username: string): Promise<number[]> {
    const user = await this.getExistingUser(username);
    const answeredSurveys = user?.usersSurveys?.answeredSurveys?.map(
      (surveyAnswer: SurveyAnswer) => surveyAnswer.surveyId,
    );
    return answeredSurveys || [];
  }

  async addToOpenSurveys(participant: Attendee | string, surveyId: number): Promise<void> {
    const existingUser = await this.getExistingUser(participant);
    if (!existingUser) {
      throw UserNotFoundError;
    }

    const usersOpenSurveys = existingUser.usersSurveys?.openSurveys || [];
    usersOpenSurveys.push(surveyId);

    const newUser: UpdateUserDto = existingUser;
    newUser.usersSurveys = {
      openSurveys: usersOpenSurveys,
      createdSurveys: existingUser.usersSurveys?.createdSurveys,
      answeredSurveys: existingUser.usersSurveys?.answeredSurveys,
    };

    await this.updateUser(participant, newUser);
  }

  async populateSurvey(participants: Attendee[], surveyId: number): Promise<void> {
    const promises: Promise<void>[] = [];
    participants.forEach((user) => {
      promises.push(this.addToOpenSurveys(user, surveyId));
    });
    await Promise.all(promises);
  }

  async addToCreatedSurveys(username: string, surveyId: number): Promise<User | null> {
    const existingUser = await this.getExistingUser(username);
    if (!existingUser) {
      throw UserNotFoundError;
    }

    const usersCreatedSurveys = existingUser.usersSurveys?.createdSurveys || [];
    usersCreatedSurveys.push(surveyId);

    const newUser: UpdateUserDto = existingUser;
    newUser.usersSurveys = {
      openSurveys: existingUser.usersSurveys?.openSurveys,
      createdSurveys: usersCreatedSurveys,
      answeredSurveys: existingUser.usersSurveys?.answeredSurveys,
    };

    const updatedUser = await this.updateUser(username, newUser);
    return updatedUser;
  }

  async onRemoveSurvey(surveyId: number): Promise<void> {
    const existingUsers = await this.userModel.find<User>().exec();

    const promises = existingUsers.map(async (user) => {
      const {
        createdSurveys = [],
        openSurveys = [],
        answeredSurveys = [],
        ...remainingUserSurveys
      } = user.usersSurveys || {};

      let shouldUpdateUser = false;

      const usersCreatedSurveys =
        createdSurveys.filter((survey: number) => {
          if (survey !== surveyId) {
            return survey;
          } else {
            shouldUpdateUser = true;
          }
        }) || [];

      const usersOpenSurveys =
        openSurveys.filter((survey: number) => {
          if (survey !== surveyId) {
            return survey;
          } else {
            shouldUpdateUser = true;
          }
        }) || [];

      const usersAnsweredSurveys =
        answeredSurveys.filter((surveyAnswer: SurveyAnswer) => {
          if (surveyAnswer.surveyId !== surveyId) {
            return surveyAnswer;
          } else {
            shouldUpdateUser = true;
          }
        }) || [];

      if (shouldUpdateUser) {
        const newUser: UpdateUserDto = {
          usersSurveys: {
            ...remainingUserSurveys,
            createdSurveys: [...usersCreatedSurveys],
            openSurveys: [...usersOpenSurveys],
            answeredSurveys: [...usersAnsweredSurveys],
          },
        };

        return await this.updateUser(user.username, newUser);
      }
    });

    await Promise.all(promises);
  }

  async addAnswer(
    username: string,
    surveyId: number,
    answer: JSON,
    canSubmitMultipleAnswers: boolean = false,
  ): Promise<User | null> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw UserNotFoundError;
    }

    const usersOpenSurveys = existingUser.usersSurveys?.openSurveys?.filter((survey) => survey !== surveyId) || [];

    const usersAnsweredSurveys =
      existingUser.usersSurveys?.answeredSurveys?.filter((surveyAnswer) => surveyAnswer.surveyId !== surveyId) || [];
    usersAnsweredSurveys.push({ surveyId, answer });

    const newUser: UpdateUserDto = existingUser;
    newUser.usersSurveys = {
      openSurveys: canSubmitMultipleAnswers ? existingUser.usersSurveys?.openSurveys : usersOpenSurveys,
      createdSurveys: existingUser.usersSurveys?.createdSurveys,
      answeredSurveys: usersAnsweredSurveys,
    };

    return await this.updateUser(username, newUser);
  }

  async getCommitedAnswer(username: string, surveyId: number): Promise<JSON | undefined> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw UserNotFoundError;
    }

    const answeredSurvey = existingUser.usersSurveys?.answeredSurveys?.find((answer: SurveyAnswer) => {
      if (answer.surveyId === surveyId) {
        return answer.answer;
      }
      return undefined;
    });

    return answeredSurvey?.answer;
  }
}

export default UsersSurveysService;
