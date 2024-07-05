import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/user.schema';
import SurveySchema, { Survey } from './survey.schema';
import SurveyAnswerSchema, { SurveyAnswer } from './survey-answer.schema';
import SurveysService from './surveys.service';
import SurveysController from './surveys.controller';
import SurveyAnswersService from './survey-answer.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Survey.name, schema: SurveySchema }]),
    MongooseModule.forFeature([{ name: SurveyAnswer.name, schema: SurveyAnswerSchema }]),
  ],
  controllers: [SurveysController],
  providers: [SurveysService, SurveyAnswersService],
})
export default class SurveysModule {}
