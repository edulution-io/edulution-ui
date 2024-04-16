import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';

import ConfigModule from '../config/config.module';

@Module({
  // imports: [MongooseModule.forRoot('mongodb://localhost:example@mongo:27017')],
  imports: [ConfigModule],
})
export default class AppModule {}
