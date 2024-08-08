import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { resolve } from 'path';
import LoggingInterceptor from '../logging/logging.interceptor';
import AppConfigModule from '../appconfig/appconfig.module';
import UsersModule from '../users/users.module';
import ConferencesModule from '../conferences/conferences.module';
import GroupsModule from '../groups/groups.module';
import ClassManagementModule from '../classManagement/classManagement.module';
import MailsModule from '../mails/mails.module';
import VdiModule from '../vdi/vdi.module';
import FilesharingModule from '../filesharing/filesharing.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: resolve(__dirname, '..', 'public', 'downloads'),
      serveRoot: '/edu-api/downloads',
    }),
    AppConfigModule,
    UsersModule,
    GroupsModule,
    ClassManagementModule,
    ConferencesModule,
    MailsModule,
    FilesharingModule,
    VdiModule,
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
