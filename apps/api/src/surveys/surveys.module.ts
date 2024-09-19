import { Module } from '@nestjs/common';
import SurveysService from './surveys.service';
import SurveysController from './surveys.controller';
import SurveyAnswersService from './survey-answer.service';
import PublicSurveysController from './public-surveys.controller';

@Module({
  imports: [SurveysService, SurveyAnswersService],
  controllers: [SurveysController, PublicSurveysController],
  providers: [SurveysService, SurveyAnswersService],
})
export default class SurveysModule {}
