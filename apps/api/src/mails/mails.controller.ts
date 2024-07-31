import { Controller, Get } from '@nestjs/common';
import { MAIL_ENDPOINT } from '@libs/dashboard/constants/mail-endpoint';
import MailDto from '@libs/dashboard/types/mail.dto';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import ImapService from './imap.service';
import UsersService from '../users/users.service';

@Controller(MAIL_ENDPOINT)
class MailsController {
  constructor(
    private readonly userService: UsersService,
  ) {}

  @Get()
  async update(@GetCurrentUsername() username: string): Promise<MailDto[]> {
    const password = await this.userService.getPassword(username);
    return ImapService.getMails(username, password);
  }
}

export default MailsController;
