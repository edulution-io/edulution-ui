import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyStatus from '@libs/survey/types/survey-status-enum';
import SurveyErrorMessages from '@libs/survey/constants/api/survey-error-messages-enum';
import SurveyAnswerErrorMessages from '@libs/survey/constants/api/survey-answer-error-messages-enum';
import UserErrorMessages from '@libs/user/constants/user-error-messages';
import { Survey, SurveyDocument } from './survey.schema';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answer.schema';
import Attendee from '../conferences/attendee.schema';
import JWTUser from '../types/JWTUser';
import checkIsSurveyExpired from './utils/check-is-survey-expired';
import checkCanUserParticipate from './utils/check-can-user-participate';

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

  async getSurvey(surveyId: mongoose.Types.ObjectId): Promise<Survey> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(SurveyErrorMessages.IdTypeError, HttpStatus.NOT_ACCEPTABLE);
    }
    const survey = await this.surveyModel.findById<Survey>(surveyId).exec();
    if (!survey) {
      throw new CustomHttpException(SurveyErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);
    }
    return survey;
  }

  async getPreviousSurveyAnswer(surveyId: mongoose.Types.ObjectId, username: string): Promise<SurveyAnswer | null> {
    return this.surveyAnswerModel
      .findOne<SurveyAnswer>({ $and: [{ 'attendee.username': username }, { surveyId }] })
      .exec();
  }

  async createNewSurveyAnswer(attendee: Attendee, surveyId: mongoose.Types.ObjectId, saveNo: number, answer: JSON) {
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
    return newSurveyAnswer;
  }

  async saveNewSurveyAnswerInSurvey(survey: Survey, attendee: Attendee, answer: SurveyAnswer) {
    const updateSurvey = await this.surveyModel
      .findByIdAndUpdate<Survey>(survey.id, {
        participatedAttendees: [...survey.participatedAttendees, attendee],
        answers: [...survey.answers, answer.id],
      })
      .exec();
    if (updateSurvey == null) {
      throw new CustomHttpException(UserErrorMessages.UpdateError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updatePreviousSurveyAnswer(surveyAnswerId: mongoose.Types.ObjectId, answer: JSON, saveNo: number) {
    const updatedSurveyAnswer = await this.surveyAnswerModel
      .findByIdAndUpdate<SurveyAnswer>(surveyAnswerId, { answer, saveNo })
      .exec();
    if (updatedSurveyAnswer == null) {
      throw new CustomHttpException(SurveyAnswerErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.NOT_FOUND);
    }

    return updatedSurveyAnswer;
  }

  async addAnswer(
    surveyId: mongoose.Types.ObjectId,
    saveNo: number,
    user: JWTUser,
    answer: JSON,
  ): Promise<SurveyAnswer | undefined> {
    const survey = await this.getSurvey(surveyId);
    const username = user.preferred_username;
    const attendee = { firstName: user.given_name, lastName: user.family_name, username };

    checkIsSurveyExpired(survey);

    const alreadyExistingSurveyAnswer = await this.getPreviousSurveyAnswer(surveyId, username);
    const { canSubmitMultipleAnswers = false, canUpdateFormerAnswer } = survey;

    let surveyAnswer: SurveyAnswer | undefined;
    if (!alreadyExistingSurveyAnswer || canSubmitMultipleAnswers) {
      surveyAnswer = await this.createNewSurveyAnswer(attendee, surveyId, saveNo, answer);
      await this.saveNewSurveyAnswerInSurvey(survey, attendee, surveyAnswer);
    } else if (canUpdateFormerAnswer) {
      surveyAnswer = await this.updatePreviousSurveyAnswer(alreadyExistingSurveyAnswer.id, answer, saveNo);
    }
    if (!surveyAnswer) {
      throw new CustomHttpException(
        SurveyAnswerErrorMessages.NotAbleToUpdateSurveyAnswerError,
        HttpStatus.NOT_MODIFIED,
      );
    }
    return surveyAnswer;
  }

  async addAnswerToPublicSurvey(
    surveyId: mongoose.Types.ObjectId,
    saveNo: number,
    answer: JSON,
    username: string,
  ): Promise<SurveyAnswer | undefined> {
    const attendee = { username };
    const survey = await this.getSurvey(surveyId);

    checkIsSurveyExpired(survey);
    checkCanUserParticipate(survey, username);

    const alreadyExistingSurveyAnswer = await this.getPreviousSurveyAnswer(surveyId, username);
    const { canSubmitMultipleAnswers = false } = survey;

    let surveyAnswer: SurveyAnswer;
    if (!alreadyExistingSurveyAnswer || canSubmitMultipleAnswers) {
      surveyAnswer = await this.createNewSurveyAnswer(attendee, surveyId, saveNo, answer);
      await this.saveNewSurveyAnswerInSurvey(survey, attendee, surveyAnswer);
    } else {
      surveyAnswer = await this.updatePreviousSurveyAnswer(alreadyExistingSurveyAnswer.id, answer, saveNo);
    }
    return surveyAnswer;
  }

  async getPrivateAnswer(surveyId: mongoose.Types.ObjectId, username: string): Promise<SurveyAnswer> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(SurveyErrorMessages.IdTypeError, HttpStatus.NOT_ACCEPTABLE);
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
      throw new CustomHttpException(SurveyErrorMessages.IdTypeError, HttpStatus.NOT_ACCEPTABLE);
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
