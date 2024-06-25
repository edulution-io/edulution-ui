import mongoose, { Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Attendee from '@libs/survey/types/attendee';
import SurveyAnswer from '@libs/survey/types/survey-answer';
import NotAbleToFindUserError from '@libs/survey/errors/not-able-to-find-user-error';
import NotAbleToFindSurveyAnswerError from '@libs/survey/errors/not-able-to-find-survey-answer-error';
import UserDidNotUpdateError from '@libs/survey/errors/not-able-to-update-user-error';
import { User, UserDocument } from '../users/user.schema';
import UpdateUserDto from '../users/dto/update-user.dto';

@Injectable()
class UsersSurveysService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async updateUser(participant: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const newUser = await this.userModel
      .findOneAndUpdate<User>({ username: participant }, updateUserDto, { new: true })
      .exec();
    if (!newUser) {
      const error = UserDidNotUpdateError;
      Logger.error(error.message);
      throw error;
    }
    return newUser;
  }

  async getExistingUser(participant: Attendee | string): Promise<User | null> {
    const name = typeof participant === 'string' ? participant : participant.username;
    const existingUser = await this.userModel.findOne<User>({ username: name }).exec();
    if (!existingUser) {
      const error = NotAbleToFindUserError;
      Logger.error(error.message);
      throw error;
    }
    return existingUser;
  }

  async getOpenSurveyIds(username: string): Promise<mongoose.Types.ObjectId[]> {
    const user = await this.getExistingUser(username);
    return user?.usersSurveys?.openSurveys || [];
  }

  async getCreatedSurveyIds(username: string): Promise<mongoose.Types.ObjectId[]> {
    const user = await this.getExistingUser(username);
    return user?.usersSurveys?.createdSurveys || [];
  }

  async getAnsweredSurveyIds(username: string): Promise<mongoose.Types.ObjectId[]> {
    const user = await this.getExistingUser(username);
    const answeredSurveys = user?.usersSurveys?.answeredSurveys?.map(
      (surveyAnswer: SurveyAnswer) => surveyAnswer.surveyId,
    );
    return answeredSurveys || [];
  }

  async addToOpenSurveys(participant: string, surveyId: mongoose.Types.ObjectId): Promise<void> {
    const existingUser = await this.getExistingUser(participant);
    if (!existingUser) {
      const error = NotAbleToFindUserError;
      Logger.error(error.message);
      throw error;
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

  async populateSurvey(participants: Attendee[], surveyId: mongoose.Types.ObjectId): Promise<void> {
    const promises: Promise<void>[] = [];
    participants.forEach((user) => {
      promises.push(this.addToOpenSurveys(user.username, surveyId));
    });
    await Promise.all(promises);
  }

  async addToCreatedSurveys(username: string, surveyId: mongoose.Types.ObjectId): Promise<User | null> {
    const existingUser = await this.getExistingUser(username);
    if (!existingUser) {
      const error = NotAbleToFindUserError;
      Logger.error(error.message);
      throw error;
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

  async onRemoveSurvey(surveyIds: mongoose.Types.ObjectId[]): Promise<void> {
    const existingUsers = await this.userModel.find<User>().exec();

    const promises = existingUsers.map(async (user): Promise<void> => {
      const {
        createdSurveys = [],
        openSurveys = [],
        answeredSurveys = [],
        ...remainingUserSurveys
      } = user.usersSurveys || {};

      let shouldUpdateUser = false;

      const usersCreatedSurveys =
        createdSurveys.filter((survey: mongoose.Types.ObjectId) => {
          if (!surveyIds.includes(survey)) {
            return true;
          }
          shouldUpdateUser = true;
          return false;
        }) || [];

      const usersOpenSurveys =
        openSurveys.filter((survey: mongoose.Types.ObjectId) => {
          if (!surveyIds.includes(survey)) {
            return true;
          }
          shouldUpdateUser = true;
          return false;
        }) || [];

      const usersAnsweredSurveys =
        answeredSurveys.filter((surveyAnswer: SurveyAnswer) => {
          if (!surveyIds.includes(surveyAnswer.surveyId)) {
            return true;
          }
          shouldUpdateUser = true;
          return false;
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

        await this.updateUser(user.username, newUser);
      }
    });

    await Promise.all(promises);
  }

  async addAnswer(
    username: string,
    surveyId: mongoose.Types.ObjectId,
    answer: JSON,
    canSubmitMultipleAnswers: boolean = false,
  ): Promise<void> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      const error = NotAbleToFindUserError;
      Logger.error(error.message);
      throw error;
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

    await this.updateUser(username, newUser);
  }

  async getCommitedAnswer(username: string, surveyId: mongoose.Types.ObjectId): Promise<JSON | undefined> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      const error = NotAbleToFindUserError;
      Logger.error(error.message);
      throw error;
    }

    const answeredSurvey = existingUser.usersSurveys?.answeredSurveys?.find((answer: SurveyAnswer) => {
      if (answer.surveyId === surveyId) {
        return answer.answer;
      }
      return undefined;
    });

    if (!answeredSurvey) {
      const error = NotAbleToFindSurveyAnswerError;
      Logger.error(error.message);
      throw error;
    }
    return answeredSurvey?.answer;
  }
}

export default UsersSurveysService;
