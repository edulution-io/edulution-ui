import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Survey, SurveyDocument } from './types/survey.schema';
import { Attendee } from '../conferences/dto/attendee';

@Injectable()
class SurveysService {
  constructor(@InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>) {}

  async findAllSurveys(): Promise<Survey[]> {
    return this.surveyModel.find().exec();
  }

  async findSurvey(surveyId: number): Promise<Survey | null> {
    return this.surveyModel.findOne<Survey>({ id: surveyId }).exec();
  }

  async findSurveys(surveyIds: number[]): Promise<Survey[] | null> {
    return this.surveyModel.find<Survey>({ id: { $in: surveyIds } }).exec();
  }

  async removeSurvey(surveyId: number): Promise<any> {
    return this.surveyModel.deleteOne({ id: surveyId }).exec();
  }

  async updateOrCreateSurvey(createSurveyDto: Survey): Promise<Survey | null> {
    const survey = await this.surveyModel
      .findOneAndUpdate<Survey>(
        { id: createSurveyDto.id },
        {
          ...createSurveyDto,
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

  async addPublicAnswer(id: number, answer: JSON, username: string): Promise<Survey | undefined> {
    const existingSurvey = await this.surveyModel.findOne<Survey>({ id }).exec();
    if (!existingSurvey) {
      throw new Error('Survey not found');
    }

    let participants = existingSurvey.participants || [];
    const isParticipant = participants.find((user: Attendee) => user.username === username);
    if (!isParticipant) {
      throw new Error('User is no participant of the survey');
    }

    let participated = existingSurvey.participated || [];
    const hasAlreadyParticipated = participated.find((user: string) => user === username);
    if (hasAlreadyParticipated) {
      throw new Error('User has already participated in the survey');
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
  }

  // async getPublicAnswers(id: number): Promise<JSON[] | undefined> {
  //   const existingSurvey = await this.surveyModel.findOne<Survey>({ id }).exec();
  //   if (!existingSurvey) {
  //     throw new Error('Survey not found');
  //   }
  //   return existingSurvey.publicAnswers;
  // }
}

export default SurveysService;
