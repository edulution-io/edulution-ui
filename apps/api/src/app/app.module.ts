import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import AppConfigModule from '../appconfig/appconfig.module';
import UsersModule from '../users/users.module';
import ConferencesModule from '../conferences/conferences.module';
// import PollsModule from '../polls-and-surveys/poll/polls.module';
// import SurveysModule from '../polls-and-surveys/survey/surveys.module';
import PollsAndSurveysModule from '../polls-and-surveys/polls-and-surveys.module';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    ConferencesModule,
    PollsAndSurveysModule,
    // PollsModule,
    // SurveysModule,
    JwtModule.register({
      global: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_SERVER_URL || 'mongodb://localhost:27017/' as string, {
      dbName: process.env.MONGODB_DATABASE_NAME || 'edulution',
      auth: { username: process.env.MONGODB_USERNAME || 'root', password: process.env.MONGODB_PASSWORD || 'example' },
    }),
  ],
})
export default class AppModule {}
