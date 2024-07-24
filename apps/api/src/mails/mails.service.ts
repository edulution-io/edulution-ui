import { Injectable, Logger } from '@nestjs/common';
import MailDto from '@libs/dashboard/types/mail.dto';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import ImapFlowGetMailsClient from './imapFlowGetMailsClient';

@Injectable()
class MailsService {
  private imapFlowGetMailsClient: ImapFlowGetMailsClient;

  constructor() {
    this.imapFlowGetMailsClient = new ImapFlowGetMailsClient();
  }

  async mailRoutine(user: JwtUser): Promise<MailDto[]> {
    Logger.log(`Getting mails for user ${user.preferred_username}`, MailsService.name);

    const host = 'localhost'; // 'mail.schulung.multi.schule';
    const port = 9994; // 993;
    const username = 'yukigrun';
    const password = 'DemoMuster!';

    return this.imapFlowGetMailsClient.fetchMails(host, port, username, password);
  }
}

export default MailsService;
