import { Body, Controller, Delete, Get, Logger, Param, Post, UseGuards } from '@nestjs/common';
import MAIL_ENDPOINT from '@libs/mail/constants/mail-endpoint';
import { MailDto, MailProviderConfigDto, CreateSyncJobDto, CreateSyncJobResponseDto } from '@libs/mail/types';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import MailsService from './mails.service';
import UsersService from '../users/users.service';
import AppConfigGuard from '../appconfig/appconfig.guard';

@Controller(MAIL_ENDPOINT)
class MailsController {
  constructor(
    private readonly userService: UsersService,
    private readonly mailsService: MailsService,
  ) {}

  @Get()
  async getMails(@GetCurrentUsername() username: string): Promise<MailDto[]> {
    const password = await this.userService.getPassword(username);
    return MailsService.getMails(username, password);
  }

  @Get('provider-config')
  async getExternalMailProviderConfig(): Promise<MailProviderConfigDto[]> {
    return this.mailsService.getExternalMailProviderConfig();
  }

  @Post('provider-config')
  @UseGuards(AppConfigGuard)
  async postExternalMailProviderConfig(
    @Body() mailProviderConfig: MailProviderConfigDto,
  ): Promise<MailProviderConfigDto[]> {
    return this.mailsService.postExternalMailProviderConfig(mailProviderConfig);
  }

  @Delete('provider-config/:mailProviderId')
  @UseGuards(AppConfigGuard)
  deleteExternalMailProviderConfig(@Param('mailProviderId') mailProviderId: string) {
    return this.mailsService
      .deleteExternalMailProviderConfig(mailProviderId)
      .catch((e) => Logger.error(e, MailsController.name));
  }

  @Get('sync-job')
  async getSyncJob(): Promise<CreateSyncJobDto> {
    return this.mailsService.getSyncJobs();
  }

  @Post('sync-job')
  async postSyncJob(@Body() createSyncJobDto: CreateSyncJobDto): Promise<CreateSyncJobResponseDto> {
    return this.mailsService.createSyncJob(createSyncJobDto);
  }
}

export default MailsController;
