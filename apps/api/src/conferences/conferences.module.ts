import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import ConferencesService from './conferences.service';
import { Conference, ConferenceSchema } from './conference.schema';
import ConferencesController from './conferences.controller';
import AppConfigModule from '../appconfig/appconfig.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Conference.name, schema: ConferenceSchema }]), AppConfigModule],
  controllers: [ConferencesController],
  providers: [ConferencesService],
})
export default class ConferencesModule {}
