import mongoose, { Model } from 'mongoose';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import AttendeeDto from '@libs/conferences/types/attendee.dto';
import UsersSurveys from '@libs/survey/types/users-surveys';
import emptyUsersSurveys from '@libs/survey/types/empty-user-surveys';
import CustomHttpException from '@libs/error/CustomHttpException';
import UserErrorMessages from '@libs/user/user-error-messages';
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
    const newUser = await this.userModel
      .findOneAndUpdate<User>({ username: participant }, updateUserDto, { new: true })
      .exec();
    if (!newUser) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToUpdateUserError, HttpStatus.NOT_FOUND);
    }
    return newUser;
  }

  async getExistingUser(participant: AttendeeDto | string): Promise<User | null> {
    const name = typeof participant === 'string' ? participant : participant.username;
    const existingUser = await this.userModel.findOne<User>({ username: name }).exec();
    if (!existingUser) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND);
    }
    return existingUser;
  }

  async getExistingUserSurveys(participant: AttendeeDto | string): Promise<UsersSurveys> {
    const existingUser = await this.getExistingUser(participant);
    return existingUser?.usersSurveys || emptyUsersSurveys;
  }

  async getOpenSurveyIds(username: string): Promise<mongoose.Types.ObjectId[]> {
    const user = await this.getExistingUser(username);
    return user?.usersSurveys?.openSurveys || [];
  }

  async getCreatedSurveyIds(username: string): Promise<mongoose.Types.ObjectId[]> {
    const user = await this.getExistingUser(username);
    return user?.usersSurveys?.createdSurveys || [];
  }

  async getAnswerIds(username: string): Promise<mongoose.Types.ObjectId[]> {
    const user = await this.getExistingUser(username);
    return user?.usersSurveys?.answeredSurveys || [];
  }

  async getAnsweredSurveyIds(username: string): Promise<mongoose.Types.ObjectId[]> {
    const surveyAnswers = await this.surveyAnswerModel.find<SurveyAnswer>({ user: { $eq: username } }).exec();
    if (surveyAnswers.length > 0) {
      return surveyAnswers.map((answer: SurveyAnswer) => answer.survey);
    }
    return [];
  }

  async getAnsweredSurveys(username: string): Promise<Survey[]> {
    const answeredSurveyIds = this.getAnsweredSurveyIds(username);
    const answeredSurveys = await this.surveyModel.find<Survey>({ _id: { $in: answeredSurveyIds } }).exec();
    return answeredSurveys || [];
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

  filterOutSurveyIds = (
    existingSurveys: mongoose.Types.ObjectId[],
    removingSurveyIds: mongoose.Types.ObjectId[],
  ): mongoose.Types.ObjectId[] =>
    existingSurveys.filter((survey: mongoose.Types.ObjectId) => !removingSurveyIds.includes(survey)) || [];

  async updateUserOnRemovalOfSurvey(user: User, surveyIds: mongoose.Types.ObjectId[]): Promise<User | null> {
    const { createdSurveys = [], openSurveys = [], answeredSurveys = [] } = user.usersSurveys || {};
    const usersCreatedSurveys = this.filterOutSurveyIds(createdSurveys, surveyIds);
    const usersOpenSurveys = this.filterOutSurveyIds(openSurveys, surveyIds);

    const userAnswers = await this.surveyAnswerModel
      .find<SurveyAnswer>({ user: { $eq: { user } }, survey: { $nin: answeredSurveys } })
      .exec();
    const usersAnsweredSurveys: mongoose.Types.ObjectId[] = userAnswers?.map((answer: SurveyAnswer) => answer.id);

    const shouldUpdateUser =
      createdSurveys.length !== usersCreatedSurveys.length ||
      openSurveys.length !== usersOpenSurveys.length ||
      answeredSurveys.length !== usersAnsweredSurveys.length;

    return new Promise(() => {
      if (shouldUpdateUser) {
        const updatedUserSurveys: UsersSurveys = {
          createdSurveys: [...usersCreatedSurveys],
          openSurveys: [...usersOpenSurveys],
          answeredSurveys: [...usersAnsweredSurveys],
        };
        this.updateUser(user.username, { usersSurveys: updatedUserSurveys })
          .then((updatedUser: User | null) => {
            if (updatedUser) {
              return updatedUser;
            }
          });
      }
      return user;
    });
  }

  async onRemoveSurveys(surveyIds: mongoose.Types.ObjectId[]): Promise<void> {
    const existingUsers: User[] = await this.userModel.find<User>({}).exec();
    if (!existingUsers) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND);
    }

    const promises: Promise<User | null>[] = [];
    existingUsers.forEach((user: User) => {
      const prom: Promise<User | null> = this.updateUserOnRemovalOfSurvey(user, surveyIds);
      promises.push(prom);
    });

    await Promise.all(promises);
  }
}

export default UsersSurveysService;
