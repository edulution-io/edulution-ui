import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import ConfigModule from '../config/config.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRoot('mongodb://localhost:27017', {
      dbName: 'settingsConfig',
      auth: { username: 'root', password: 'example' },
    }),
  ],
})
export default class AppModule {}
