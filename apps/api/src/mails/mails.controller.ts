import { Controller, Post } from '@nestjs/common';
import MAIL_ENDPOINT from '@libs/mails/constants/mails-endpoints';

@Controller(MAIL_ENDPOINT)
class MailsController {
  @Post()
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  postMailsConfig() {
    return 'Hello World!';
  }
}

export default MailsController;
