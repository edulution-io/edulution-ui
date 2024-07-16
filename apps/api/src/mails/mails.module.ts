import { Module } from '@nestjs/common';
import MailsController from './mails.controller';
// import MailsService from './mails.service';

@Module({
  imports: [],
  controllers: [MailsController],
  providers: [/*MailsService*/],
})
export default class MailsModule {}
