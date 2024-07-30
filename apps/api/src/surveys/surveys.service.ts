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
    const updatedSurvey = await this.surveyModel
      .findByIdAndUpdate<Survey>(
        // eslint-disable-next-line no-underscore-dangle
        survey._id,
        { ...survey },
      )
      .exec()
      .catch((error) => {
        throw new CustomHttpException(UserErrorMessages.DatabaseOfflineError, HttpStatus.INTERNAL_SERVER_ERROR, error);
      });

    if (updatedSurvey == null) {
      Logger.log(SurveyErrorMessages.NotAbleToUpdateSurveyError, SurveysService.name);
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToUpdateSurveyError, HttpStatus.NOT_MODIFIED);
    }
    Logger.log('Updated survey successfully', SurveysService.name);

    return updatedSurvey;
  }

  async createSurvey(survey: Survey): Promise<Survey | null> {
    let createdSurvey;
    try {
      createdSurvey = await this.surveyModel.create(survey);
    } catch (error) {
      throw new CustomHttpException(UserErrorMessages.DatabaseOfflineError, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
    Logger.log(
      createdSurvey == null ? SurveyErrorMessages.NotAbleToCreateSurveyError : 'Created the new survey successfully',
      SurveysService.name,
    );
    return createdSurvey;
  }

  async updateOrCreateSurvey(survey: Survey): Promise<Survey | null> {
    let updatedSurvey: Survey | null = null;
    try {
      updatedSurvey = await this.updateSurvey(survey);
    } catch (error) {
      Logger.log(
        error instanceof Error ? error.message : SurveyErrorMessages.NotAbleToUpdateSurveyError,
        SurveysService.name,
      );
    }
    if (updatedSurvey != null) {
      return updatedSurvey;
    }

    let createdSurvey: Survey | null = null;
    try {
      createdSurvey = await this.createSurvey(survey);
    } catch (error) {
      Logger.log(
        error instanceof Error ? error.message : SurveyErrorMessages.NotAbleToCreateSurveyError,
        SurveysService.name,
      );
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
