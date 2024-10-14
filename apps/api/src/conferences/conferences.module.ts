import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import ConferencesService from './conferences.service';
import { Conference, ConferenceSchema } from './conference.schema';
import ConferencesController from './conferences.controller';
import AppConfigModule from '../appconfig/appconfig.module';
import TokenService from '../common/services/token.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Conference.name, schema: ConferenceSchema }]), AppConfigModule],
  controllers: [ConferencesController],
  providers: [ConferencesService, TokenService],
})
export default class ConferencesModule {}
