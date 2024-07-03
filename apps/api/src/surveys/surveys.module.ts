import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import SurveySchema, { Survey } from './survey.schema';
import SurveysController from './surveys.controller';
import SurveysService from './surveys.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Survey.name, schema: SurveySchema }])],
  controllers: [SurveysController],
  providers: [SurveysService],
})
export default class SurveysModule {}
