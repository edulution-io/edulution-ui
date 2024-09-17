import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import SurveySchema, { Survey } from './survey.schema';
import SurveyAnswerSchema, { SurveyAnswer } from './survey-answer.schema';
import SurveysService from './surveys.service';
import SurveysController from './surveys.controller';
import SurveyAnswersService from './survey-answer.service';
import PublicSurveysController from './public-surveys.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Survey.name, schema: SurveySchema }]),
    MongooseModule.forFeature([{ name: SurveyAnswer.name, schema: SurveyAnswerSchema }]),
  ],
  controllers: [SurveysController, PublicSurveysController],
  providers: [SurveysService, SurveyAnswersService],
})
export default class SurveysModule {}
