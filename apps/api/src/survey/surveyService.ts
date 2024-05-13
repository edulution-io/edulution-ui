import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Survey, SurveyDocument } from './survey.schema';
import CreateSurveyDto from './dto/create-survey.dto';
import UpdateSurveyDto from './dto/update-survey.dto';

@Injectable()
class SurveyService {
  constructor(@InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>) {}

  async createSurvey(createSurveyDto: CreateSurveyDto): Promise<Survey> {
    const newSurvey = await this.surveyModel.create(createSurveyDto);
    return newSurvey;
  }

  async findAllSurveys(): Promise<Survey[]> {
    return this.surveyModel.find().exec();
  }

  async findSurvey(surveyName: string): Promise<Survey | null> {
    return this.surveyModel.findOne<Survey>({ surveyname: surveyName }).exec();
  }

  async findParticipatedSurveys(participant: string): Promise<Survey[] | null> {
    return this.surveyModel.find<Survey>({ participants: { $includes: { participant } } }).exec();
  }

  async removeSurvey(surveyName: string): Promise<any> {
    return this.surveyModel.deleteOne({ surveyname: surveyName }).exec();
  }

  async updateSurvey(surveyName: string, updateSurveyDto: UpdateSurveyDto): Promise<Survey | null> {
    return this.surveyModel.findOneAndUpdate<Survey>({ surveyname: surveyName }, updateSurveyDto).exec();
  }
}

export default SurveyService;
