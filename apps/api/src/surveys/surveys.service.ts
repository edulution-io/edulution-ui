import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import Attendee from '@libs/survey/types/attendee';
import UpdateOrCreateSurveyDto from '@libs/survey/types/update-or-create-survey.dto';
import { SurveyModel, SurveyDocument } from './survey.schema';

@Injectable()
class SurveysService {
  constructor(@InjectModel(SurveyModel.name) private surveyModel: Model<SurveyDocument>) {}

  async getAllSurveys(): Promise<SurveyModel[]> {
    const surveys = this.surveyModel.find().exec();
    if (surveys == null) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToFindSurveysError, HttpStatus.NOT_FOUND);
    }
    return surveys;
  }

  async findOneSurvey(surveyId: mongoose.Types.ObjectId): Promise<SurveyModel | null> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotValidSurveyIdIsNoMongooseObjectId,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    const survey = this.surveyModel.findOne<SurveyModel>({ id: surveyId }).exec();
    if (survey == null) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToFindSurveyError, HttpStatus.NOT_FOUND);
    }
    return survey;
  }

  async findSurveys(surveyIds: mongoose.Types.ObjectId[]): Promise<SurveyModel[] | null> {
    const surveys = this.surveyModel.find<SurveyModel>({ id: { $in: surveyIds } }).exec();
    if (surveys == null) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToFindSurveysError, HttpStatus.NOT_FOUND);
    }
    return surveys;
  }

  async deleteSurveys(surveyIds: mongoose.Types.ObjectId[]): Promise<void> {
    try {
      await this.surveyModel.deleteMany({ id: { $in: surveyIds } }).exec();
      Logger.log(`Deleted the surveys ${JSON.stringify(surveyIds)}`);
    } catch (error) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToDeleteSurveyError, HttpStatus.NOT_MODIFIED);
    }
  }

  async updateSurvey(survey: UpdateOrCreateSurveyDto): Promise<SurveyModel | null> {
    const updatedSurvey = await this.surveyModel
      .findOneAndUpdate<SurveyModel>(
        // eslint-disable-next-line no-underscore-dangle
        { id: survey.id },
        { ...survey },
      )
      .exec();

    Logger.log(updatedSurvey == null ? SurveyErrorMessages.NotAbleToUpdateSurveyError : 'Updated survey successfully');
    return updatedSurvey;
  }

  async createSurvey(survey: UpdateOrCreateSurveyDto): Promise<SurveyModel | null> {
    const createdSurvey = await this.surveyModel.create(survey);
    Logger.log(
      createdSurvey == null ? SurveyErrorMessages.NotAbleToCreateSurveyError : 'Created the new survey successfully',
    );
    return createdSurvey;
  }

  async addPublicAnswer(
    surveyId: mongoose.Types.ObjectId,
    answer: JSON,
    username?: string,
    canSubmitMultipleAnswers: boolean = false,
  ): Promise<SurveyModel | undefined> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotValidSurveyIdIsNoMongooseObjectId,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const existingSurvey = await this.surveyModel.findOne<SurveyModel>({ id: surveyId }).exec();
    if (!existingSurvey) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToFindSurveyError, HttpStatus.NOT_FOUND);
    }

    const participants = existingSurvey.participants || [];
    const participated = existingSurvey.participated || [];
    const answers = existingSurvey.publicAnswers || [];
    if (username) {
      const isParticipant = participants.find((participant: Attendee) => participant.username === username);
      if (!isParticipant) {
        throw new CustomHttpException(
          SurveyErrorMessages.NotAbleToParticipateNotAnParticipantError,
          HttpStatus.UNAUTHORIZED,
        );
      }
      const hasAlreadyParticipated = participated.find((user: string) => user === username);
      if (hasAlreadyParticipated) {
        throw new CustomHttpException(
          SurveyErrorMessages.NotAbleToParticipateAlreadyParticipatedError,
          HttpStatus.FORBIDDEN,
        );
      }
      if (!hasAlreadyParticipated) {
        participated.push(username);
      }
      if (!hasAlreadyParticipated || canSubmitMultipleAnswers) {
        answers.push(answer);
      }
    }

    const updatedSurvey = await this.surveyModel
      .findOneAndUpdate<SurveyModel>({ id: surveyId }, { publicAnswers: answers, participated })
      .exec();
    if (updatedSurvey == null) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToUpdateSurveyError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return updatedSurvey;
  }

  async getPublicAnswers(surveyId: mongoose.Types.ObjectId): Promise<JSON[] | null> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotValidSurveyIdIsNoMongooseObjectId,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const survey = await this.surveyModel.findOne<SurveyModel>({ id: surveyId }).exec();
    if (survey == null) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToFindSurveyError, HttpStatus.NOT_FOUND);
    }

    return survey.publicAnswers || [];
  }
}

export default SurveysService;
