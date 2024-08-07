import { Controller, Get } from '@nestjs/common';
import MAIL_ENDPOINT from '@libs/mails/constants/mails-endpoints';
import MailProviderConfigDto from '@libs/mails/types/mailProviderConfig.dto';
import MailsService from './mails.service';

@Controller(MAIL_ENDPOINT)
class MailsController {
  constructor(private readonly mailsService: MailsService) {}

  @Get('provider-config')
  async getExternalMailProviderConfig(): Promise<MailProviderConfigDto[]> {
    return this.mailsService.getExternalMailProviderConfig();
  }
}

export default MailsController;
