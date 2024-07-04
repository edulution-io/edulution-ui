import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import UsersSurveys from '@libs/survey/types/users-surveys';
import UserErrorMessages from '@libs/user/user-error-messages';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import SurveyAnswerErrorMessages from '@libs/survey/survey-answer-error-messages';
import { User, UserDocument } from '../users/user.schema';
import { Survey, SurveyDocument } from './survey.schema';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answer.schema';

@Injectable()
class SurveyAnswersService {
  constructor(
    @InjectModel(SurveyAnswer.name) private surveyAnswerModel: Model<SurveyAnswerDocument>,
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onRemoveUser(userNames: mongoose.Types.ObjectId[]): Promise<void> {
    try {
      await this.surveyAnswerModel.deleteMany({ user: { $in: userNames } }).exec();
    } catch (error) {
      throw new CustomHttpException(
        SurveyAnswerErrorMessages.NotAbleToDeleteSurveyAnswerError,
        HttpStatus.NOT_MODIFIED,
        error,
      );
    }
  }

  async onRemoveSurveys(surveyIds: mongoose.Types.ObjectId[]): Promise<void> {
    try {
      await this.surveyAnswerModel.deleteMany({ survey: { $in: surveyIds } }).exec();
    } catch (error) {
      throw new CustomHttpException(
        SurveyAnswerErrorMessages.NotAbleToDeleteSurveyAnswerError,
        HttpStatus.NOT_MODIFIED,
        error,
      );
    }
  }

  async createNewAnswer(
    surveyId: mongoose.Types.ObjectId,
    username: string,
    usersSurveys: UsersSurveys,
    saveNo: number,
    answer: JSON,
    canSubmitMultipleAnswers: boolean = false,
  ): Promise<SurveyAnswer | undefined> {
    const isCreator = usersSurveys?.createdSurveys?.find((survey: mongoose.Types.ObjectId) => survey === surveyId);
    const isParticipant = usersSurveys?.openSurveys?.find((survey: mongoose.Types.ObjectId) => survey === surveyId);
    const canParticipate = isCreator || isParticipant;
    if (!canParticipate) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotAbleToParticipateNotAnParticipantError,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const time = new Date().getTime();
    const id = mongoose.Types.ObjectId.createFromTime(time);
    const newUsersSurveyAnswer = await this.surveyAnswerModel.create({
      _id: id,
      id,
      saveNo,
      user: username,
      survey: surveyId,
      answer,
    });
    if (newUsersSurveyAnswer == null) {
      throw new CustomHttpException(
        SurveyAnswerErrorMessages.NotAbleToCreateSurveyAnswerError,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const updateUsersOpenSurveys = canSubmitMultipleAnswers
      ? usersSurveys?.openSurveys || []
      : usersSurveys?.openSurveys?.filter((openSurvey: mongoose.Types.ObjectId) => openSurvey !== surveyId) || [];

    const updateUsersUsersSurveyAnswers =
      usersSurveys && usersSurveys.answeredSurveys
        ? [...usersSurveys.answeredSurveys, newUsersSurveyAnswer.id]
        : [newUsersSurveyAnswer.id];

    const updatedUsersSurveys = {
      openSurveys: updateUsersOpenSurveys,
      createdSurveys: usersSurveys?.createdSurveys || [],
      answeredSurveys: updateUsersUsersSurveyAnswers,
    };

    const updateExistingUser = await this.userModel
      .findOneAndUpdate<User>({ username }, { usersSurveys: updatedUsersSurveys })
      .exec();
    if (updateExistingUser == null) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToUpdateUserError, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return newUsersSurveyAnswer;
  }

  async updateExistingAnswer(
    idExistingSurveyAnswer: mongoose.Types.ObjectId,
    saveNo: number,
    answer: JSON,
    canUpdateFormerAnswer: boolean = true,
  ): Promise<SurveyAnswer | undefined> {
    if (!idExistingSurveyAnswer) {
      throw new CustomHttpException(SurveyAnswerErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.BAD_REQUEST);
    }

    const canNotParticipateAgain = !canUpdateFormerAnswer;
    if (canNotParticipateAgain) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotAbleToParticipateAlreadyParticipatedError,
        HttpStatus.FORBIDDEN,
      );
    }

    const updatedSurveyAnswer = await this.surveyAnswerModel
      .findOneAndUpdate<SurveyAnswer>({ _id: idExistingSurveyAnswer }, { answer, saveNo })
      .exec();
    if (updatedSurveyAnswer == null) {
      throw new CustomHttpException(SurveyAnswerErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.NOT_FOUND);
    }

    return updatedSurveyAnswer;
  }

  async addAnswer(
    surveyId: mongoose.Types.ObjectId,
    answer: JSON,
    participant: string,
  ): Promise<SurveyAnswer | undefined> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotValidSurveyIdIsNoMongooseObjectId,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const existingSurvey = await this.surveyModel.findOne<Survey>({ _id: surveyId }).exec();
    if (!existingSurvey) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToFindSurveyError, HttpStatus.NOT_FOUND);
    }

    const {
      expirationDate,
      expirationTime,
      canUpdateFormerAnswer,
      canSubmitMultipleAnswers,
      saveNo = 0,
    } = existingSurvey;

    if (expirationDate && expirationTime) {
      const expirationDateAndTime = new Date(`${expirationDate.toDateString()}T${expirationTime.toString()}`);
      const isExpired = expirationDateAndTime < new Date();
      if (isExpired) {
        throw new CustomHttpException(
          SurveyErrorMessages.NotAbleToParticipateSurveyExpiredError,
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    const existingUser = await this.userModel.findOne<User>({ username: participant }).exec();
    if (!existingUser) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND);
    }

    // const idExistingUsersAnswer = existingUser.usersSurveys?.answeredSurveys?.find((userAnswer) => userAnswer === surveyId);
    const idExistingUsersAnswer = await this.surveyAnswerModel
      .findOne<SurveyAnswer>({ survey: surveyId, user: participant })
      .exec();
    if (!idExistingUsersAnswer || canSubmitMultipleAnswers) {
      return this.createNewAnswer(
        surveyId,
        participant,
        {
          openSurveys: existingUser.usersSurveys?.openSurveys || [],
          createdSurveys: existingUser.usersSurveys?.createdSurveys || [],
          answeredSurveys: existingUser.usersSurveys?.answeredSurveys || [],
        },
        saveNo,
        answer,
      );
    }
    return this.updateExistingAnswer(idExistingUsersAnswer.id, saveNo, answer, canUpdateFormerAnswer);
  }

  async getPrivateAnswer(surveyId: mongoose.Types.ObjectId, username: string): Promise<SurveyAnswer> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotValidSurveyIdIsNoMongooseObjectId,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    const usersSurveyAnswer = await this.surveyAnswerModel
      .findOne<SurveyAnswer>({ survey: surveyId, user: username })
      .exec();
    if (usersSurveyAnswer == null) {
      throw new CustomHttpException(SurveyAnswerErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.NOT_FOUND);
    }
    return usersSurveyAnswer;
  }

  async getPublicAnswers(surveyId: mongoose.Types.ObjectId): Promise<JSON[] | null> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotValidSurveyIdIsNoMongooseObjectId,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    const surveyAnswers = await this.surveyAnswerModel.find<SurveyAnswer>({ survey: surveyId }).exec();
    if (surveyAnswers.length === 0) {
      throw new CustomHttpException(SurveyAnswerErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.NOT_FOUND);
    }
    return surveyAnswers.map((surveyAnswer: SurveyAnswer) => surveyAnswer.answer);
  }
}

export default SurveyAnswersService;
