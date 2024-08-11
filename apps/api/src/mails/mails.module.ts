import { Module } from '@nestjs/common';
import MailsController from './mails.controller';
import MailsService from './mails.service';

@Module({
  controllers: [MailsController],
  providers: [MailsService],
})
export default class MailsModule {}
