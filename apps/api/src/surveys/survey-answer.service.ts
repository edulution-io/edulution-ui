import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import UserErrorMessages from '@libs/user/user-error-messages';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import SurveyAnswerErrorMessages from '@libs/survey/survey-answer-error-messages';
import SurveyStatus from '@libs/survey/types/survey-status-enum';
import { Survey, SurveyDocument } from './survey.schema';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answer.schema';
import Attendee from '../conferences/attendee.schema';
import JWTUser from '../types/JWTUser';

@Injectable()
class SurveyAnswersService {
  constructor(
    @InjectModel(SurveyAnswer.name) private surveyAnswerModel: Model<SurveyAnswerDocument>,
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
  ) {}

  async getCreatedSurveys(username: string): Promise<Survey[]> {
    const createdSurveys = await this.surveyModel.find<Survey>({ 'creator.username': username }).exec();
    return createdSurveys || [];
  }

  public getOpenSurveys = async (username: string): Promise<Survey[]> => {
    const openSurveys = await this.surveyModel
      .find<Survey>({
        $and: [
          { 'invitedAttendees.username': username },
          {
            $or: [
              { $nor: [{ participatedAttendees: { $elemMatch: { username } } }] },
              { canSubmitMultipleAnswers: true },
            ],
          },
        ],
      })
      .exec();
    return openSurveys || [];
  };

  async getAnswers(username: string): Promise<SurveyAnswer[]> {
    const surveyAnswers = await this.surveyAnswerModel.find<SurveyAnswer>({ 'attendee.username': username }).exec();
    return surveyAnswers || [];
  }

  async getAnsweredSurveys(username: string): Promise<Survey[]> {
    const surveyAnswers = await this.getAnswers(username);
    const answeredSurveyIds = surveyAnswers.map((answer: SurveyAnswer) => answer.surveyId);
    const answeredSurveys = await this.surveyModel.find<Survey>({ _id: { $in: answeredSurveyIds } }).exec();
    return answeredSurveys || [];
  }

  async findUserSurveys(status: SurveyStatus, username: string): Promise<Survey[] | null> {
    switch (status) {
      case SurveyStatus.OPEN:
        return this.getOpenSurveys(username);
      case SurveyStatus.ANSWERED:
        return this.getAnsweredSurveys(username);
      case SurveyStatus.CREATED:
        return this.getCreatedSurveys(username);
      default:
        return [];
    }
  }

  async addAnswer(
    surveyId: mongoose.Types.ObjectId,
    saveNo: number,
    user: JWTUser,
    answer: JSON,
  ): Promise<SurveyAnswer | undefined> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotValidSurveyIdIsNoMongooseObjectId,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const username = user.preferred_username;
    const attendee = { firstName: user.given_name, lastName: user.family_name, username };

    const survey = await this.surveyModel.findById<Survey>(surveyId).exec();
    if (!survey) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToFindSurveyError, HttpStatus.NOT_FOUND);
    }
    const { expirationDate, expirationTime, canUpdateFormerAnswer, canSubmitMultipleAnswers } = survey;

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

    const hasParticipated = survey.participatedAttendees.find(
      (participant: Attendee) => participant.username === username,
    );
    if (hasParticipated && !canSubmitMultipleAnswers && !canUpdateFormerAnswer) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotAbleToParticipateAlreadyParticipatedError,
        HttpStatus.FORBIDDEN,
      );
    }

    const isCreator = survey.creator.username === username;
    const isAttendee = survey.invitedAttendees.find((participant: Attendee) => participant.username === username);
    const canParticipate = isCreator || isAttendee;
    if (!canParticipate) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotAbleToParticipateNotAnParticipantError,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const idExistingUsersAnswer = await this.surveyAnswerModel
      .findOne<SurveyAnswer>({ $and: [{ 'attendee.username': username }, { surveyId }] })
      .exec();

    if (!idExistingUsersAnswer || canSubmitMultipleAnswers) {
      const time = new Date().getTime();
      const id = mongoose.Types.ObjectId.createFromTime(time);
      const newSurveyAnswer = await this.surveyAnswerModel.create({
        _id: id,
        id,
        attendee,
        surveyId,
        saveNo,
        answer,
      });
      if (newSurveyAnswer == null) {
        throw new CustomHttpException(
          SurveyAnswerErrorMessages.NotAbleToCreateSurveyAnswerError,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const updateSurvey = await this.surveyModel
        .findByIdAndUpdate<Survey>(surveyId, {
          participatedAttendees: [...survey.participatedAttendees, attendee],
          answers: [...survey.answers, newSurveyAnswer.id],
        })
        .exec();
      if (updateSurvey == null) {
        throw new CustomHttpException(UserErrorMessages.NotAbleToUpdateUserError, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return newSurveyAnswer;
    }

    const updatedSurveyAnswer = await this.surveyAnswerModel
      .findByIdAndUpdate<SurveyAnswer>(idExistingUsersAnswer, { answer, saveNo })
      .exec();
    if (updatedSurveyAnswer == null) {
      throw new CustomHttpException(SurveyAnswerErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.NOT_FOUND);
    }

    return updatedSurveyAnswer;
  }

  async getPrivateAnswer(surveyId: mongoose.Types.ObjectId, username: string): Promise<SurveyAnswer> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotValidSurveyIdIsNoMongooseObjectId,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    const usersSurveyAnswer = await this.surveyAnswerModel
      .findOne<SurveyAnswer>({ $and: [{ 'attendee.username': username }, { surveyId }] })
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
    const surveyAnswers = await this.surveyAnswerModel.find<SurveyAnswer>({ surveyId }).exec();
    if (surveyAnswers.length === 0) {
      throw new CustomHttpException(SurveyAnswerErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.NOT_FOUND);
    }
    return surveyAnswers.map((surveyAnswer: SurveyAnswer) => surveyAnswer.answer);
  }

  async onSurveyRemoval(surveyIds: mongoose.Types.ObjectId[]): Promise<void> {
    try {
      await this.surveyAnswerModel.deleteMany({ surveyId: { $in: surveyIds } }, { ordered: false }).exec();
    } catch (error) {
      throw new CustomHttpException(
        SurveyAnswerErrorMessages.NotAbleToDeleteSurveyAnswerError,
        HttpStatus.NOT_MODIFIED,
        error,
      );
    }
  }
}

export default SurveyAnswersService;