import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import AttendeeDto from '@libs/conferences/types/attendee.dto';
import { Survey, SurveyDocument } from './survey.schema';

@Injectable()
class SurveysService {
  constructor(@InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>) {}

  async getAllSurveys(): Promise<Survey[]> {
    const surveys = this.surveyModel.find().exec();
    if (surveys == null) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToFindSurveysError, HttpStatus.NOT_FOUND);
    }
    return surveys;
  }

  async findOneSurvey(surveyId: mongoose.Types.ObjectId): Promise<Survey | null> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotValidSurveyIdIsNoMongooseObjectId,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    const survey = this.surveyModel.findOne<Survey>({ id: surveyId }).exec();
    if (survey == null) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToFindSurveyError, HttpStatus.NOT_FOUND);
    }
    return survey;
  }

  async findSurveys(surveyIds: mongoose.Types.ObjectId[]): Promise<Survey[] | null> {
    const surveys = this.surveyModel.find<Survey>({ id: { $in: surveyIds } }).exec();
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

    Logger.log(updatedSurvey == null ? SurveyErrorMessages.NotAbleToUpdateSurveyError : 'Updated survey successfully');
    return updatedSurvey;
  }

  async createSurvey(survey: Survey): Promise<Survey | null> {
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
  ): Promise<Survey | undefined> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotValidSurveyIdIsNoMongooseObjectId,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const existingSurvey = await this.surveyModel.findOne<Survey>({ id: surveyId }).exec();
    if (!existingSurvey) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToFindSurveyError, HttpStatus.NOT_FOUND);
    }

    const participants = existingSurvey.participants || [];
    const participated = existingSurvey.participated || [];
    if (username) {
      const isParticipant = participants.find((participant: AttendeeDto) => participant.username === username);
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
      participated.push(username);
    }

    const answers = existingSurvey.publicAnswers || [];
    answers.push(answer);

    const updatedSurvey = await this.surveyModel
      .findOneAndUpdate<Survey>({ id: surveyId }, { publicAnswers: answers, participated })
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

    const survey = await this.surveyModel.findOne<Survey>({ id: surveyId }).exec();
    if (survey == null) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToFindSurveyError, HttpStatus.NOT_FOUND);
    }

    return survey.publicAnswers || [];
  }
}

export default SurveysService;
