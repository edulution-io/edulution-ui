import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/contants/common-error-messages';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import { Survey, SurveyDocument } from './survey.schema';
import Attendee from '../conferences/attendee.schema';

@Injectable()
class SurveysService {
  constructor(@InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>) {}

  async findSurvey(surveyId: mongoose.Types.ObjectId, username: string): Promise<Survey | null> {
    const survey = await this.surveyModel.findOne<Survey>({ id: surveyId }).exec();
    if (survey == null) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.NOT_FOUND);
    }

    const isCreator = survey.creator.username === username;
    const isAttendee = survey.invitedAttendees.find((participant: Attendee) => participant.username === username);
    if (isCreator || isAttendee) {
      return survey;
    }
    throw new CustomHttpException(CommonErrorMessages.PermissionDenied, HttpStatus.NOT_FOUND);
  }

  async deleteSurveys(surveyIds: mongoose.Types.ObjectId[]): Promise<void> {
    try {
      await this.surveyModel.deleteMany({ _id: { $in: surveyIds } }).exec();
      Logger.log(`Deleted the surveys ${JSON.stringify(surveyIds)}`, SurveysService.name);
    } catch (error) {
      throw new CustomHttpException(SurveyErrorMessages.DeleteError, HttpStatus.NOT_MODIFIED, error);
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
        throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
      });
  }

  async createSurvey(survey: Survey): Promise<Survey | null> {
    try {
      return await this.surveyModel.create(survey);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
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
