import mongoose, { Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Attendee from '@libs/survey/types/attendee';
import NeitherAbleToUpdateNorToCreateSurveyError from '@libs/survey/errors/neither-able-to-update-nor-to-create-survey-error';
import NotAbleToDeleteSurveyError from '@libs/survey/errors/not-able-to-delete-survey-error';
import NotAbleToFindSurveyError from '@libs/survey/errors/not-able-to-find-survey-error';
import NotAbleToFindSurveysError from '@libs/survey/errors/not-able-to-find-surveys-error';
import NotAbleToParticpateNotAnParticipantError from '@libs/survey/errors/not-able-to-particpate-not-an-participant-error';
import NotAbleToParticpateAlreadyParticipatedError from '@libs/survey/errors/not-able-to-particpate-already-participated-error';
import NotValidSurveyIdIsNoMongooseObjectId from '@libs/survey/errors/not-valid-survey-id-is-no-mongoose-object-id';
import NotAbleToUpdateSurveyError from '@libs/survey/errors/not-able-to-update-survey-error';
import { SurveyModel, SurveyDocument } from './survey.schema';

@Injectable()
class SurveysService {
  constructor(@InjectModel(SurveyModel.name) private surveyModel: Model<SurveyDocument>) {}

  async getAllSurveys(): Promise<SurveyModel[]> {
    const surveys = this.surveyModel.find().exec();
    if (surveys == null) {
      const error = NotAbleToFindSurveysError;
      Logger.error(error.message);
      throw error;
    }
    return surveys;
  }

  async findOneSurvey(surveyId: mongoose.Types.ObjectId): Promise<SurveyModel | null> {
    if (!mongoose.isValidObjectId(surveyId)) {
      const error = NotValidSurveyIdIsNoMongooseObjectId;
      Logger.error(error.message);
      throw error;
    }
    const survey = this.surveyModel.findOne<SurveyModel>({ _id: surveyId }).exec();
    if (survey == null) {
      const error = NotAbleToFindSurveyError;
      Logger.error(error.message);
      throw error;
    }
    return survey;
  }

  async findSurveys(surveyIds: mongoose.Types.ObjectId[]): Promise<SurveyModel[] | null> {
    const surveys = this.surveyModel.find<SurveyModel>({ _id: { $in: surveyIds } }).exec();
    if (surveys == null) {
      const error = NotAbleToFindSurveysError;
      Logger.error(error.message);
      throw error;
    }
    return surveys;
  }

  async deleteSurveys(surveyIds: mongoose.Types.ObjectId[]): Promise<void> {
    try {
      await this.surveyModel.deleteMany({ _id: { $in: surveyIds } }).exec();
      Logger.log(`Deleted the surveys ${JSON.stringify(surveyIds)}`);
    } catch (error) {
      const err = NotAbleToDeleteSurveyError;
      Logger.error(err.message);
      Logger.warn(error);
      throw err;
    }
  }

  async updateSurvey(survey: SurveyModel): Promise<SurveyModel | null> {
    const updatedSurvey = await this.surveyModel
      .findOneAndUpdate<SurveyModel>(
        // eslint-disable-next-line no-underscore-dangle
        { _id: survey._id },
        { ...survey },
      )
      .exec();

    Logger.log(updatedSurvey == null ? 'Could not update the survey' : 'Updated survey successfully');
    return updatedSurvey;
  }

  async createSurvey(survey: SurveyModel): Promise<SurveyModel | null> {
    const createdSurvey = await this.surveyModel.create(survey);
    Logger.log(createdSurvey == null ? 'Could not create the new survey' : 'Created the new survey successfully');
    return createdSurvey;
  }

  async updateOrCreateSurvey(survey: SurveyModel): Promise<SurveyModel | null> {
    const updatedSurvey = await this.updateSurvey(survey);
    if (updatedSurvey == null) {
      const createdSurvey = await this.createSurvey(survey);
      if (createdSurvey == null) {
        const error = NeitherAbleToUpdateNorToCreateSurveyError;
        Logger.error(error.message);
        throw error;
      }
      return createdSurvey;
    }
    return updatedSurvey;
  }

  async addPublicAnswer(
    surveyId: mongoose.Types.ObjectId,
    answer: JSON,
    username?: string,
  ): Promise<SurveyModel | undefined> {
    // Logger.log(`Adding public answer to survey ${surveyId}`);

    if (!mongoose.isValidObjectId(surveyId)) {
      const error1 = NotValidSurveyIdIsNoMongooseObjectId;
      Logger.error(error1.message);
      throw error1;
    }

    const existingSurvey = await this.surveyModel.findOne<SurveyModel>({ _id: surveyId }).exec();
    if (!existingSurvey) {
      const error2 = NotAbleToFindSurveyError;
      Logger.error(error2.message);
      throw error2;
    }

    const participants = existingSurvey.participants || [];
    const participated = existingSurvey.participated || [];
    if (username) {
      const isParticipant = participants.find((participant: Attendee) => participant.username === username);
      if (!isParticipant) {
        const error3 = NotAbleToParticpateNotAnParticipantError;
        Logger.warn(error3.message);
        throw error3;
      }
      const hasAlreadyParticipated = participated.find((user: string) => user === username);
      if (hasAlreadyParticipated) {
        const error4 = NotAbleToParticpateAlreadyParticipatedError;
        Logger.warn(error4.message);
        throw error4;
      }
      participated.push(username);
    }

    const answers = existingSurvey.publicAnswers || [];
    answers.push(answer);

    const updatedSurvey = await this.surveyModel
      .findOneAndUpdate<SurveyModel>({ _id: surveyId }, { publicAnswers: answers, participated })
      .exec();
    if (updatedSurvey == null) {
      const error5 = NotAbleToUpdateSurveyError;
      Logger.error(error5.message);
      throw error5;
    }
    return updatedSurvey;
  }

  async getPublicAnswers(surveyId: mongoose.Types.ObjectId): Promise<JSON[] | null> {
    if (!mongoose.isValidObjectId(surveyId)) {
      const error1 = NotValidSurveyIdIsNoMongooseObjectId;
      Logger.error(error1.message);
      throw error1;
    }

    const survey = await this.surveyModel.findOne<SurveyModel>({ _id: surveyId }).exec();
    if (survey == null) {
      const error2 = NotAbleToFindSurveyError;
      Logger.error(error2.message);
      throw error2;
    }
    return survey.publicAnswers || [];
  }
}

export default SurveysService;