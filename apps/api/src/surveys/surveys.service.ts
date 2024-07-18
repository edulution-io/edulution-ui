import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import { Survey, SurveyDocument } from './survey.schema';

@Injectable()
class SurveysService {
  constructor(@InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>) {}

  async findOneSurvey(surveyId: mongoose.Types.ObjectId): Promise<Survey | null> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotValidSurveyIdIsNoMongooseObjectId,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    const survey = this.surveyModel.findOne<Survey>({ _id: surveyId }).exec();
    if (survey == null) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToFindSurveyError, HttpStatus.NOT_FOUND);
    }
    return survey;
  }

  async findSurveys(surveyIds: mongoose.Types.ObjectId[]): Promise<Survey[] | null> {
    const surveys = this.surveyModel.find<Survey>({ _id: { $in: surveyIds } }).exec();
    if (surveys == null) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToFindSurveysError, HttpStatus.NOT_FOUND);
    }
    return surveys;
  }

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
      .findOneAndUpdate<Survey>(
        // eslint-disable-next-line no-underscore-dangle
        { _id: survey._id },
        { ...survey },
      )
      .exec();

    Logger.log(
      updatedSurvey == null ? SurveyErrorMessages.NotAbleToUpdateSurveyError : 'Updated survey successfully',
      SurveysService.name,
    );
    return updatedSurvey;
  }

  async createSurvey(survey: Survey): Promise<Survey | null> {
    const createdSurvey = await this.surveyModel.create(survey);
    Logger.log(
      createdSurvey == null ? SurveyErrorMessages.NotAbleToCreateSurveyError : 'Created the new survey successfully',
      SurveysService.name,
    );
    return createdSurvey;
  }
}

export default SurveysService;
