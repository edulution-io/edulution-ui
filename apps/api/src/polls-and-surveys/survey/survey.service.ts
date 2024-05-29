import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Survey, SurveyDocument } from './types/survey.schema';
import CreateSurveyDto from './dto/create-survey.dto';

@Injectable()
class SurveyService {
  constructor(@InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>) {}

  async findAllSurveys(): Promise<Survey[]> {
    return this.surveyModel.find().exec();
  }

  async findSurvey(surveyName: string): Promise<Survey | null> {
    return this.surveyModel.findOne<Survey>({ surveyname: surveyName }).exec();
  }

  async findSurveys(surveyNames: string[]): Promise<Survey[] | null> {
    return this.surveyModel.find<Survey>({ surveyname: { $in: surveyNames } }).exec();
  }

  async removeSurvey(surveyName: string): Promise<any> {
    return this.surveyModel.deleteOne({ surveyname: surveyName }).exec();
  }

  async updateOrCreateSurvey(createSurveyDto: CreateSurveyDto): Promise<Survey | null> {

    const survey = await this.surveyModel
      .findOneAndUpdate<Survey>(
        { surveyname: createSurveyDto.surveyname },
        {
          ...createSurveyDto,
          saveNo: createSurveyDto.saveNo ? createSurveyDto.saveNo.toString() : undefined,
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
}

export default SurveyService;
