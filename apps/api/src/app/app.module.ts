import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import ConfigModule from '../config/config.module';
import AuthenticationModule from '../auth/auth.module';

@Module({
  imports: [
    AuthenticationModule,
    ConfigModule,
    JwtModule.register({
      global: true,
    }),
    MongooseModule.forRoot('mongodb://localhost:27017', {
      dbName: 'settingsConfig',
      auth: { username: process.env.MONGODB_USERNAME, password: process.env.MONGODB_PASSWORD },
    }),
  ],
})
export default class AppModule {}
