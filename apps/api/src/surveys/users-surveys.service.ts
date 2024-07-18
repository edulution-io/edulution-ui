import mongoose, { Model } from 'mongoose';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import AttendeeDto from '@libs/conferences/types/attendee.dto';
import UsersSurveys from '@libs/survey/types/users-surveys';
import CustomHttpException from '@libs/error/CustomHttpException';
import UserErrorMessages from '@libs/user/user-error-messages';
import SurveyStatus from '@libs/survey/types/survey-status-enum';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import { User, UserDocument } from '../users/user.schema';
import { Survey, SurveyDocument } from './survey.schema';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answer.schema';
import UpdateUserDto from '../users/dto/update-user.dto';

@Injectable()
class UsersSurveysService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
    @InjectModel(SurveyAnswer.name) private surveyAnswerModel: Model<SurveyAnswerDocument>,
  ) {}

  async updateUser(participant: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    try {
      const newUser = await this.userModel
        .findOneAndUpdate<User>({ username: participant }, updateUserDto, { new: true })
        .exec();
      if (!newUser) {
        throw new Error('No updated user object was returned');
      }
      return newUser;
    } catch (error) {
      throw new CustomHttpException(
        UserErrorMessages.NotAbleToUpdateUserError,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async getExistingUser(participant: AttendeeDto | string): Promise<User | null> {
    try {
      const name = typeof participant === 'string' ? participant : participant.username;
      const existingUser = await this.userModel.findOne<User>({ username: name }).exec();
      if (!existingUser) {
        throw new Error('No user object was returned');
      }
      return existingUser;
    } catch (error) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND, error);
    }
  }

  async findSurveys(surveyIds: mongoose.Types.ObjectId[]): Promise<Survey[] | null> {
    if (surveyIds.length === 0) {
      throw new CustomHttpException(SurveyErrorMessages.notAbleToFindSurveyParameterError, HttpStatus.BAD_REQUEST);
    }

    try {
      const surveys = await this.surveyModel.find<Survey>({ _id: { $in: surveyIds } }).exec();
      if (surveys == null) {
        throw new Error('No survey was returned');
      }
      return surveys;
    } catch (error) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToFindSurveysError, HttpStatus.NOT_FOUND);
    }
  }

  async findUserSurveys(status: SurveyStatus, username: string): Promise<Survey[] | null> {
    switch (status) {
      case SurveyStatus.OPEN:
        return this.findSurveys(await this.getOpenSurveyIds(username));
      case SurveyStatus.ANSWERED:
        return this.findSurveys(await this.getAnsweredSurveyIds(username));
      case SurveyStatus.CREATED:
        return this.findSurveys(await this.getCreatedSurveyIds(username));
      default:
        return [];
    }
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
    try {
      const surveyAnswers = await this.surveyAnswerModel.find<SurveyAnswer>({ user: { $eq: username } }).exec();
      if (surveyAnswers.length === 0) {
        throw new Error('No survey-answers was returned');
      }
      return surveyAnswers.map((answer: SurveyAnswer) => answer.survey);
    } catch (error) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToFindSurveyError, HttpStatus.NOT_FOUND, error);
      return [];
    }
  }

  async addToOpenSurveys(participant: string, surveyId: mongoose.Types.ObjectId): Promise<void> {
    const existingUser = await this.getExistingUser(participant);
    if (!existingUser) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND);
    }

    const usersOpenSurveys = existingUser.usersSurveys?.openSurveys || [];
    usersOpenSurveys.push(surveyId);

    const newUser: UpdateUserDto = existingUser;
    newUser.usersSurveys = {
      openSurveys: usersOpenSurveys,
      createdSurveys: existingUser.usersSurveys?.createdSurveys || [],
      answeredSurveys: existingUser.usersSurveys?.answeredSurveys || [],
    };

    await this.updateUser(participant, newUser);
  }

  async populateSurvey(participants: AttendeeDto[], surveyId: mongoose.Types.ObjectId): Promise<void> {
    const promises: Promise<void>[] = [];
    participants.forEach((user) => {
      promises.push(this.addToOpenSurveys(user.username, surveyId));
    });
    await Promise.all(promises);
  }

  async addToCreatedSurveys(username: string, surveyId: mongoose.Types.ObjectId): Promise<User | null> {
    const existingUser = await this.getExistingUser(username);
    if (!existingUser) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND);
    }

    const usersCreatedSurveys = existingUser.usersSurveys?.createdSurveys || [];
    usersCreatedSurveys.push(surveyId);

    const newUser: UpdateUserDto = existingUser;
    newUser.usersSurveys = {
      openSurveys: existingUser.usersSurveys?.openSurveys || [],
      createdSurveys: usersCreatedSurveys,
      answeredSurveys: existingUser.usersSurveys?.answeredSurveys || [],
    };

    const updatedUser = await this.updateUser(username, newUser);
    if (!updatedUser) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToUpdateUserError, HttpStatus.NOT_FOUND);
    }
    return updatedUser;
  }

  async saveUserWithUpdatedUsersSurveys(
    user: User,
    usersCreatedSurveys: mongoose.Types.ObjectId[],
    usersOpenSurveys: mongoose.Types.ObjectId[],
    usersAnsweredSurveys: mongoose.Types.ObjectId[],
  ): Promise<User | null> {
    const updatedUserSurveys: UsersSurveys = {
      createdSurveys: [...usersCreatedSurveys],
      openSurveys: [...usersOpenSurveys],
      answeredSurveys: [...usersAnsweredSurveys],
    };

    return this.updateUser(user.username, { usersSurveys: updatedUserSurveys });
  }

  static filterOutSurveyIds = (
    existingSurveys: mongoose.Types.ObjectId[],
    removingSurveyIds: mongoose.Types.ObjectId[],
  ): mongoose.Types.ObjectId[] =>
    existingSurveys.filter((survey: mongoose.Types.ObjectId) => !removingSurveyIds.includes(survey)) || [];

  async updateUsersUsersSurveysOnSurveyRemoval(user: User, surveyIds: mongoose.Types.ObjectId[]): Promise<User | null> {
    const { createdSurveys = [], openSurveys = [], answeredSurveys = [] } = user.usersSurveys || {};
    const usersCreatedSurveys = UsersSurveysService.filterOutSurveyIds(createdSurveys, surveyIds);
    const usersOpenSurveys = UsersSurveysService.filterOutSurveyIds(openSurveys, surveyIds);

    const userAnswers = await this.surveyAnswerModel
      .find<SurveyAnswer>({ user: { $eq: { user } }, survey: { $nin: answeredSurveys } })
      .exec();
    const usersAnsweredSurveys: mongoose.Types.ObjectId[] = userAnswers?.map((answer: SurveyAnswer) => answer.id);

    const shouldUpdateUser =
      createdSurveys.length !== usersCreatedSurveys.length ||
      openSurveys.length !== usersOpenSurveys.length ||
      answeredSurveys.length !== usersAnsweredSurveys.length;

    if (shouldUpdateUser) {
      return this.saveUserWithUpdatedUsersSurveys(user, usersCreatedSurveys, usersOpenSurveys, usersAnsweredSurveys);
    }
    return user;
  }

  async updateUsersOnSurveyRemoval(surveyIds: mongoose.Types.ObjectId[]): Promise<void> {
    const existingUsers: User[] = await this.userModel.find<User>({}).exec();
    if (!existingUsers) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND);
    }

    const promises: Promise<User | null>[] = [];
    existingUsers.forEach((user: User) => {
      const prom: Promise<User | null> = this.updateUsersUsersSurveysOnSurveyRemoval(user, surveyIds);
      promises.push(prom);
    });
    await Promise.all(promises);
  }
}

export default UsersSurveysService;
