import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { APP_INTERCEPTOR } from '@nestjs/core';
import AppConfigModule from '../appconfig/appconfig.module';
import UsersModule from '../users/users.module';
import ConferencesModule from '../conferences/conferences.module';
import GroupsModule from '../groups/groups.module';
import ClassManagementModule from '../classManagement/classManagement.module';
import VdiModule from '../vdi/vdi.module';
import LoggingInterceptor from '../logging/logging.interceptor';
import SurveysModule from '../surveys/surveys.module';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    GroupsModule,
    ClassManagementModule,
    ConferencesModule,
    VdiModule,
    SurveysModule,
    JwtModule.register({
      global: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_SERVER_URL as string, {
      dbName: process.env.MONGODB_DATABASE_NAME,
      auth: { username: process.env.MONGODB_USERNAME, password: process.env.MONGODB_PASSWORD },
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export default class AppModule {}
