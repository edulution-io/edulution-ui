import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import MailService from './mail.service';
import MailController from './mail.controller';

@Module({
  imports: [HttpModule],
  controllers: [MailController],
  providers: [MailService],
})
export default class MailModule {}
