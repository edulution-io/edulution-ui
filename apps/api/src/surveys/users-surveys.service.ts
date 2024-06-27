import mongoose, { Model } from 'mongoose';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Attendee from '@libs/survey/types/attendee';
import SurveyAnswer from '@libs/survey/types/survey-answer';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import UserErrorMessages from '@libs/user/user-error-messages';
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
      throw new CustomHttpException(UserErrorMessages.NotAbleToUpdateUserError, HttpStatus.NOT_FOUND);
    }
    return newUser;
  }

  async getExistingUser(participant: Attendee | string): Promise<User | null> {
    const name = typeof participant === 'string' ? participant : participant.username;
    const existingUser = await this.userModel.findOne<User>({ username: name }).exec();
    if (!existingUser) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND);
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
      throw new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND);
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
      throw new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND);
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
    if (!existingUsers) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND);
    }

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
      throw new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND);
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
      throw new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND);
    }

    const answeredSurvey = existingUser.usersSurveys?.answeredSurveys?.find((answer: SurveyAnswer) => {
      if (answer.surveyId === surveyId) {
        return answer.answer;
      }
      return undefined;
    });

    if (!answeredSurvey) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.NOT_FOUND);
    }
    return answeredSurvey?.answer;
  }
}

export default UsersSurveysService;
