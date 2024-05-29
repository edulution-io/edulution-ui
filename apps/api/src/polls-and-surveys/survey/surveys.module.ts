import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../users/user.schema';
import { Survey, SurveySchema } from './../survey/types/survey.schema';
import UsersSurveysService from './../survey/users-surveys.service';
import SurveysController from './../survey/surveys.controller';
import SurveyService from './../survey/survey.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Survey.name, schema: SurveySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [SurveysController],
  providers: [SurveyService, UsersSurveysService],
})
export default class SurveysModule {}
