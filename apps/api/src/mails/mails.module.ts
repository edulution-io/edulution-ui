import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import MailsController from './mails.controller';
import MailsService from './mails.service';
import { MailProvider, MailProviderSchema } from './mail-provider.schema';
import AppConfigService from '../appconfig/appconfig.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: MailProvider.name, schema: MailProviderSchema }])],
  controllers: [MailsController],
  providers: [MailsService, AppConfigService],
})
export default class MailsModule {}
