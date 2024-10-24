import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import { Survey, SurveyDocument } from './survey.schema';

@Injectable()
class SurveysService {
  constructor(@InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>) {}

  async findPublicSurvey(surveyId: mongoose.Types.ObjectId): Promise<Survey | null> {
    try {
      return await this.surveyModel.findOne<Survey>({ _id: surveyId, isPublic: true }).lean();
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async deleteSurveys(surveyIds: mongoose.Types.ObjectId[]): Promise<void> {
    try {
      await this.surveyModel.deleteMany({ _id: { $in: surveyIds } });
      Logger.log(`Deleted the surveys ${JSON.stringify(surveyIds)}`, SurveysService.name);
    } catch (error) {
      throw new CustomHttpException(SurveyErrorMessages.DeleteError, HttpStatus.NOT_MODIFIED, error);
    }
  }

  async createSurvey(survey: Survey): Promise<Survey | null> {
    try {
      return await this.surveyModel.create(survey);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async updateSurvey(survey: Survey): Promise<Survey | null> {
    try {
      // eslint-disable-next-line no-underscore-dangle
      return await this.surveyModel.findByIdAndUpdate(survey._id, { ...survey });
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }

    // TODO: NIEDUUI-405: Survey: Update backendLimiters on question removal or name change of a question
  }

  async updateOrCreateSurvey(survey: Survey): Promise<Survey | null> {
    const updatedSurvey = await this.updateSurvey(survey);
    if (updatedSurvey != null) {
      return updatedSurvey;
    }
    const createdSurvey = await this.createSurvey(survey);
    if (createdSurvey != null) {
      return createdSurvey;
    }
    throw new CustomHttpException(SurveyErrorMessages.UpdateOrCreateError, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export default SurveysService;
