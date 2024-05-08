import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import AppConfigModule from '../appconfig/appconfig.module';
import UsersModule from '../users/users.module';
import ConferencesModule from '../conferences/conferences.module';
import MailModule from '../mail/mail.module';

@Module({
  imports: [
    AppConfigModule,
    ConferencesModule,
    JwtModule.register({
      global: true,
    }),
    MailModule,
    MongooseModule.forRoot('mongodb://localhost:27017', {
      dbName: 'edulution',
      auth: { username: process.env.MONGODB_USERNAME, password: process.env.MONGODB_PASSWORD },
    }),
    UsersModule,
  ],
})
export default class AppModule {}
