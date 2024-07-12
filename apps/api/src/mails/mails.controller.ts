import { Controller, Get, Logger } from '@nestjs/common';
import { GetUsername } from '../common/decorators/getUser.decorator';
import MailsService from './mails.service';
import mockedMails from './dto/mocked-mails';

@Controller('mails')
class MailsController {
  constructor(private readonly mailsService: MailsService) {}

  @Get()
  async update(@GetUsername() username: string) {
    try {
      return await this.mailsService.getMails(username);
    } catch (error) {
      Logger.log('Error while fetching mails', error);
      return mockedMails;
    }
  }
}

export default MailsController;
