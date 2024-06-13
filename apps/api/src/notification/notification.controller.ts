import { Controller, Get } from '@nestjs/common';
import { GetUsername } from '../common/decorators/getUser.decorator';
import ImapFlowGetMailsClient from './imapFlowGetMailsClient';

@Controller('mails')
class NotificationController {
  @Get()
  async update(@GetUsername() username: string) {
    try {
      const ImapClient = new ImapFlowGetMailsClient(username);
      await ImapClient.connect();
      return await ImapClient.getMails();
    } catch(error) {
      return error;
    }
  }
}

export default NotificationController;
