import { Injectable } from '@nestjs/common';
import { FetchMessageObject } from 'imapflow';
import ImapFlowGetMailsClient from './imapFlowGetMailsClient';

@Injectable()
class MailsService {
  constructor() {}

  async getMails(username: string): Promise<FetchMessageObject[] > {
    const ImapClient = new ImapFlowGetMailsClient(username);
    await ImapClient.connect();
    return await ImapClient.getMails();
  }
}

export default MailsService;
