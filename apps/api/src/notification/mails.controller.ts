import { Controller, Get } from '@nestjs/common';
// import { GetUsername } from '../common/decorators/getUser.decorator';
// import NotificationService from './notification.service';
import mockedMails from './dto/mocked-mails';

@Controller('mails')
class MailsController {
  constructor(
    // private readonly notificationService: NotificationService,
  ) {}

  @Get()
  async update( /* @GetUsername() username: string */ ) {
    // return await this.notificationService.getMails(username);
    return mockedMails;
  }
}

export default MailsController;

