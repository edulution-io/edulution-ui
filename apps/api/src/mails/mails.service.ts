import { FetchMessageObject } from 'imapflow';
import { Injectable, Logger } from '@nestjs/common';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import MailDto from '@libs/dashboard/types/mail.dto';
import ImapFlowGetMailsClient from './imapFlowGetMailsClient';
import mockedMails from './mockedMails';

@Injectable()
class MailsService {
  private imapFlowGetMailsClient: ImapFlowGetMailsClient;

  constructor() {
    this.imapFlowGetMailsClient = new ImapFlowGetMailsClient();
  }

  async mailRoutine(user: JwtUser): Promise<FetchMessageObject[] | MailDto[]> {
    Logger.log(`Getting mails for user ${user.preferred_username}`, MailsService.name);

    const host = 'localhost'; // 'mail.schulung.multi.schule';
    const port = 9994; // 993;
    const username = 'yukigrun';
    const password = 'DemoMuster!';

    try {
      this.imapFlowGetMailsClient.createClient(host, port, username, password);
    } catch (error) {
      Logger.error(`Unable to create client \n Error: ${error}`, MailsService.name);
      return mockedMails;
    }
    try {
      await this.imapFlowGetMailsClient.connect();
    } catch (error) {
      Logger.error(`Unable to connect \n Error: ${error}`, MailsService.name);
      return mockedMails;
    }

    let mails: FetchMessageObject[] | MailDto[] = [];
    try {
      mails = await this.imapFlowGetMailsClient.getMails();
    } catch (error) {
      Logger.error(`Unable to fetch mails \n Error: ${error}`, MailsService.name);
      return mockedMails;
    }

    try {
      await this.imapFlowGetMailsClient.disconnect();
    } catch (error) {
      Logger.error(`Unable to disconnect \n Error: ${error}`, MailsService.name);
      return mockedMails;
    }

    return mails;
  }
}

export default MailsService;
