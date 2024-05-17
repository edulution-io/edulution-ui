import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import ConferencesService from './conferences.service';
import { Conference, ConferenceSchema } from './conference.schema';
import ConferencesController from './conferences.controller';
import AppConfigService from '../appconfig/appconfig.service';
import AppConfigSchema, { AppConfig } from '../appconfig/appconfig.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Conference.name, schema: ConferenceSchema }]),
    MongooseModule.forFeature([{ name: AppConfig.name, schema: AppConfigSchema, collection: 'apps' }]),
  ],
  controllers: [ConferencesController],
  providers: [ConferencesService, AppConfigService],
})
export default class ConferencesModule {}
