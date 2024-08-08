import { Body, Controller, Get, Post } from '@nestjs/common';
import MAIL_ENDPOINT from '@libs/mail/constants/mail-endpoint';
import MailProviderConfigDto from '@libs/mail/types/mailProviderConfig.dto';
import MailsService from './mails.service';

@Controller(MAIL_ENDPOINT)
class MailsController {
  constructor(private readonly mailsService: MailsService) {}

  @Get('provider-config')
  async getExternalMailProviderConfig(): Promise<MailProviderConfigDto[]> {
    return this.mailsService.getExternalMailProviderConfig();
  }

  @Post('provider-config')
  async postExternalMailProviderConfig(
    @Body() mailProviderConfig: MailProviderConfigDto,
  ): Promise<MailProviderConfigDto> {
    return this.mailsService.postExternalMailProviderConfig(mailProviderConfig);
  }
}

export default MailsController;
