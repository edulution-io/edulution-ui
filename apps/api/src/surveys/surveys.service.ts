import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import Attendee from '@libs/conferences/types/attendee';
import { Survey, SurveyDocument } from './types/survey.schema';
import NotAbleToDeleteError from './errors/not-able-to-delete-error';
import SurveyNotFoundError from './errors/survey-not-found-error';
// import UserIsNoParticipantError from './errors/user-is-no-participant-error';
import UserHasAlreadyParticipatedError from './errors/user-has-already-participated-error';
import CreateSurveyDto from './dto/create-survey.dto';

@Injectable()
class SurveysService {
  constructor(@InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>) {}

  async findAllSurveys(): Promise<Survey[]> {
    return this.surveyModel.find().exec();
  }

  async findSurvey(surveyId: mongoose.Types.ObjectId): Promise<Survey | null> {
    return this.surveyModel.findOne<Survey>({ id: surveyId }).exec();
  }

  async findSurveys(surveyIds: mongoose.Types.ObjectId[]): Promise<Survey[] | null> {
    return this.surveyModel.find<Survey>({ id: { $in: surveyIds } }).exec();
  }

  async removeSurvey(surveyId: mongoose.Types.ObjectId): Promise<void> {
    try {
      await this.surveyModel.deleteOne({ id: surveyId }).exec();
    } catch (error) {
      console.error(error);
      throw NotAbleToDeleteError;
    }
  }

  async updateOrCreateSurvey(createSurveyDto: CreateSurveyDto): Promise<Survey | null> {
    const survey = await this.surveyModel
      .findOneAndUpdate<Survey>(
        { _id: createSurveyDto.id },
        {
          ...createSurveyDto,
          _id: createSurveyDto.id,
          saveNo: createSurveyDto.saveNo || 0,
          created: createSurveyDto.created ? createSurveyDto.created.toString() : new Date().toString(),
        },
      )
      .exec();
    if (survey != null) {
      return survey;
    }
    const newSurvey = await this.surveyModel.create(createSurveyDto);
    return newSurvey;
  }

  async addPublicAnswer(id: mongoose.Types.ObjectId, answer: JSON, username: string): Promise<Survey | undefined> {
    const existingSurvey = await this.surveyModel.findOne<Survey>({ id }).exec();
    if (!existingSurvey) {
      throw SurveyNotFoundError;
    }

    // const participants = existingSurvey.participants || [];
    // const isParticipant = participants.find((user: Attendee) =>
    //   user.username && username ? user.username === username : false,
    // );
    // if (!isParticipant) {
    //   throw UserIsNoParticipantError;
    // }

    const participated = existingSurvey.participated || [];
    const hasAlreadyParticipated = participated.find((user: string) => user === username);
    if (hasAlreadyParticipated) {
      throw UserHasAlreadyParticipatedError;
    }
    const answers = existingSurvey.publicAnswers || [];
    answers.push(answer);

    participated.push(username);

    const updatedSurvey = await this.surveyModel
      .findOneAndUpdate<Survey>({ id }, { publicAnswers: answers, participated })
      .exec();
    if (updatedSurvey != null) {
      return updatedSurvey;
    }

    return undefined;
  }
}

export default SurveysService;
