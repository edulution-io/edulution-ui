import { Controller, Get } from '@nestjs/common';
import { MAIL_ENDPOINT } from '@libs/dashboard/feed/mails/constants/mail-endpoint';
import MailDto from '@libs/dashboard/feed/mails/types/mail.dto';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import MailsService from './mails.service';
import UsersService from '../users/users.service';

@Controller(MAIL_ENDPOINT)
class MailsController {
  constructor(
    private readonly userService: UsersService,
  ) {}

  @Get()
  async getMails(@GetCurrentUsername() username: string): Promise<MailDto[]> {
    const password = await this.userService.getPassword(username);
    return MailsService.getMails(username, password);
  }
}

export default MailsController;
