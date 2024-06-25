import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import SurveySchema, { SurveyModel } from './survey.schema';
import { User, UserSchema } from '../users/user.schema';
import SurveysController from './surveys.controller';
import SurveysService from './surveys.service';
import UsersSurveysService from './users-surveys.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SurveyModel.name, schema: SurveySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [SurveysController],
  providers: [SurveysService, UsersSurveysService],
})
export default class SurveysModule {}
