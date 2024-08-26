import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import MailsController from './mails.controller';
import MailsService from './mails.service';
import { MailProvider, MailProviderSchema } from './mail-provider.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: MailProvider.name, schema: MailProviderSchema }])],
  controllers: [MailsController],
  providers: [MailsService],
})
export default class MailsModule {}
