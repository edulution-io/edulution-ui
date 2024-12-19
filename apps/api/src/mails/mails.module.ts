import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import MailsController from './mails.controller';
import MailsService from './mails.service';
import { MailProvider, MailProviderSchema } from './mail-provider.schema';
import { AppConfig, AppConfigSchema } from '../appconfig/appconfig.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MailProvider.name, schema: MailProviderSchema }]),
    MongooseModule.forFeature([{ name: AppConfig.name, schema: AppConfigSchema }]),
  ],
  controllers: [MailsController],
  providers: [MailsService],
})
export default class MailsModule {}
