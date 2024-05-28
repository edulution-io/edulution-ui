import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/user.schema';
import { Poll, PollSchema } from './poll/types/poll.schema';
import { Survey, SurveySchema } from './survey/types/survey.schema';
import UsersPollsService from './poll/users-polls.service';
import PollsController from './poll/polls.controller';
import PollService from './poll/poll.service';
import UsersSurveysService from './survey/users-surveys.service';
import SurveysController from './survey/surveys.controller';
import SurveyService from './survey/survey.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Survey.name, schema: SurveySchema }]),
    MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [SurveysController, PollsController],
  providers: [SurveyService, UsersSurveysService, PollService, UsersPollsService],
})
export default class PollsAndSurveysModule {}
