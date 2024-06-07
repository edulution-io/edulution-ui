import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/user.schema';
import { Conference, ConferenceSchema } from '../conferences/conference.schema';
import SurveySchema, { Survey } from '../surveys/types/survey.schema';
import NotificationController from './notification.controller';
import NotificationService from './notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Conference.name, schema: ConferenceSchema }]),
    MongooseModule.forFeature([{ name: Survey.name, schema: SurveySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export default class SurveysModule {}
