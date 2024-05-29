import { join } from 'path';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import AuthModule from 'src/auth/auth.module';
import AppConfigModule from '../appconfig/appconfig.module';
import UsersModule from '../users/users.module';
import ConferencesModule from '../conferences/conferences.module';
import FilemanagerModule from '../filemanager/filemanager.module';
import ClassManagementModule from '../classManagement/classManagement.module';
import PollsModule from '../polls-and-surveys/poll/polls.module';
import SurveyModule from '../polls-and-surveys/survey/surveys.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/edu-api/',
    }),
    AppConfigModule,
    UsersModule,
    ConferencesModule,
    PollsModule,
    SurveyModule,
    ClassManagementModule,
    FilemanagerModule,
    AuthModule,
    JwtModule.register({
      global: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_SERVER_URL as string, {
      dbName: process.env.MONGODB_DATABASE_NAME,
      auth: { username: process.env.MONGODB_USERNAME, password: process.env.MONGODB_PASSWORD },
    }),
  ],
})
export default class AppModule {}
