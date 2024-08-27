import { Module } from '@nestjs/common';
import SurveysService from './surveys.service';
import SurveysController from './surveys.controller';
import SurveyAnswersService from './survey-answer.service';

@Module({
  imports: [SurveysService, SurveyAnswersService],
  controllers: [SurveysController],
  providers: [SurveysService, SurveyAnswersService],
})
export default class SurveysModule {}
