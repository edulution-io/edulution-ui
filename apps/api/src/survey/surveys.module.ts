import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Survey, SurveySchema } from './types/survey.schema';
import SurveysController from './surveys.controller';
import SurveyService from './survey.service';
import UsersSurveysService from './users-surveys.service';
import { User, UserSchema } from '../users/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Survey.name, schema: SurveySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [SurveysController],
  providers: [SurveyService, UsersSurveysService],
})
export default class SurveysModule {}