import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import UserErrorMessages from '@libs/user/user-error-messages';
import { Survey, SurveyDocument } from './survey.schema';

@Injectable()
class SurveysService {
  constructor(@InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>) {}

  async deleteSurveys(surveyIds: mongoose.Types.ObjectId[]): Promise<void> {
    try {
      await this.surveyModel.deleteMany({ _id: { $in: surveyIds } }).exec();
      Logger.log(`Deleted the surveys ${JSON.stringify(surveyIds)}`, SurveysService.name);
    } catch (error) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToDeleteSurveyError, HttpStatus.NOT_MODIFIED, error);
    }
  }

  async updateSurvey(survey: Survey): Promise<Survey | null> {
    return this.surveyModel
      .findByIdAndUpdate<Survey>(
        // eslint-disable-next-line no-underscore-dangle
        survey._id,
        { ...survey },
      )
      .exec()
      .catch((error) => {
        throw new CustomHttpException(UserErrorMessages.DatabaseOfflineError, HttpStatus.INTERNAL_SERVER_ERROR, error);
      });
  }

  async createSurvey(survey: Survey): Promise<Survey | null> {
    try {
      return await this.surveyModel.create(survey);
    } catch (error) {
      throw new CustomHttpException(UserErrorMessages.DatabaseOfflineError, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async updateOrCreateSurvey(survey: Survey): Promise<Survey | null> {
    let updatedSurvey: Survey | null = null;
    try {
      updatedSurvey = await this.updateSurvey(survey);
    } catch (error) {
      // Do nothing
    }
    if (updatedSurvey != null) {
      return updatedSurvey;
    }

    let createdSurvey: Survey | null = null;
    try {
      createdSurvey = await this.createSurvey(survey);
    } catch (error) {
      // Do nothing
    }
    if (createdSurvey != null) {
      return createdSurvey;
    }
    throw new CustomHttpException(
      SurveyErrorMessages.NeitherAbleToUpdateNorToCreateSurveyError,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export default SurveysService;
