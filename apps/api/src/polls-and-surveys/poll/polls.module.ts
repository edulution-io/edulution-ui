import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../users/user.schema';
import { Poll, PollSchema } from './types/poll.schema';
import UsersPollsService from './../poll/users-polls.service';
import PollsController from './../poll/polls.controller';
import PollService from './../poll/poll.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [PollsController],
  providers: [PollService, UsersPollsService],
})
export default class PollsModule {}
