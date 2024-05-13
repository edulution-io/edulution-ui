import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import SurveysController from './surveys.controller';
import SurveyService from './survey.service';
import { Survey, SurveySchema } from './survey.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Survey.name, schema: SurveySchema }])],
  controllers: [SurveysController],
  providers: [SurveyService],
})
export default class SurveysModule {}
