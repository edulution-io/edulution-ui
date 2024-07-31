import { Controller, Get } from '@nestjs/common';
import { MAIL_ENDPOINT } from '@libs/dashboard/constants/mail-endpoint';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import GetCurrentUser from '../common/decorators/getUser.decorator';
import PasswordService from '../users/password.service';
import imapFetchMails from './imap-fetch-mails';

@Controller(MAIL_ENDPOINT)
class MailsController {
  constructor(private readonly passwordService: PasswordService) {}

  @Get()
  async update(@GetCurrentUser() user: JwtUser) {
    const password = await this.passwordService.getPassword(user);
    return imapFetchMails(user.preferred_username, password);
  }
}

export default MailsController;
