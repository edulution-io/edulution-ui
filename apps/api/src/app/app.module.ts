import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import AuthModule from 'src/auth/auth.module';
import UsersModule from 'src/users/users.module';
import AppConfigModule from '../appconfig/appconfig.module';
import ConferencesModule from '../conferences/conferences.module';
import FilemanagerModule from '../filemanager/filemanager.module.ts';
import SurveysModule from '../survey/surveys.module';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    ConferencesModule,
    FilemanagerModule,
    AuthModule,
    SurveysModule,
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
