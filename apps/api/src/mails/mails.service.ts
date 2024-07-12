import { Injectable } from '@nestjs/common';
import { FetchMessageObject } from 'imapflow';
// import ImapFlowGetMailsClient from './imapFlowGetMailsClient';
import mockedMails from "./dto/mocked-mails";

@Injectable()
class MailsService {
  constructor() {}

  async getMails(/*username: string*/): Promise<FetchMessageObject[] > {
    // const ImapClient = new ImapFlowGetMailsClient(username);
    // await ImapClient.connect();
    // return await ImapClient.getMails();
    return mockedMails;
  }
}

export default MailsService;
