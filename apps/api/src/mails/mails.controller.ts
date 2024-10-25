import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import MAIL_ENDPOINT from '@libs/mail/constants/mail-endpoint';
import { CreateSyncJobDto, MailDto, MailProviderConfigDto, SyncJobDto } from '@libs/mail/types';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import MailsService from './mails.service';
import UsersService from '../users/users.service';
import AppConfigGuard from '../appconfig/appconfig.guard';

@ApiTags(MAIL_ENDPOINT)
@ApiBearerAuth()
@Controller(MAIL_ENDPOINT)
class MailsController {
  constructor(
    private readonly userService: UsersService,
    private readonly mailsService: MailsService,
  ) {}

  @Get()
  async getMails(@GetCurrentUsername() username: string): Promise<MailDto[]> {
    const password = await this.userService.getPassword(username);
    return this.mailsService.getMails(username, password);
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
    return this.mailsService.deleteExternalMailProviderConfig(mailProviderId);
  }

  @Get('sync-job')
  async getSyncJob(@GetCurrentUsername() username: string): Promise<SyncJobDto[]> {
    return this.mailsService.getSyncJobs(username);
  }

  @Post('sync-job')
  async postSyncJob(
    @Body() createSyncJobDto: CreateSyncJobDto,
    @GetCurrentUsername() username: string,
  ): Promise<SyncJobDto[]> {
    return this.mailsService.createSyncJob(createSyncJobDto, username);
  }

  @Delete('sync-job')
  async deleteSyncJobs(@Body() syncJobIds: string[], @GetCurrentUsername() username: string): Promise<SyncJobDto[]> {
    return this.mailsService.deleteSyncJobs(syncJobIds, username);
  }
}

export default MailsController;
