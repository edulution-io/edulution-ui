import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import AppConfigModule from '../appconfig/appconfig.module';
import UsersModule from '../users/users.module';
import ConferencesModule from '../conferences/conferences.module';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    ConferencesModule,
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
