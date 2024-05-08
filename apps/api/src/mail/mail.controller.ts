import { Controller, Get } from '@nestjs/common';
import MailService from './mail.service';

@Controller('mail')
class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get()
  getMails() {
    return this.mailService.processEmails();
  }
}

export default MailController;
