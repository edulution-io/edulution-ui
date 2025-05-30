/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import MAIL_ENDPOINT from '@libs/mail/constants/mail-endpoint';
import { CreateSyncJobDto, MailDto, MailProviderConfigDto, SyncJobDto } from '@libs/mail/types';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import GetUsersEmailAddress from '../common/decorators/getUsersEmailAddress.decorator';
import MailsService from './mails.service';
import UsersService from '../users/users.service';
import AppConfigGuard from '../appconfig/appconfig.guard';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';

@ApiTags(MAIL_ENDPOINT)
@ApiBearerAuth()
@Controller(MAIL_ENDPOINT)
class MailsController {
  constructor(
    private readonly userService: UsersService,
    private readonly mailsService: MailsService,
  ) {}

  @Get()
  async getMails(
    @GetCurrentUsername() username: string,
    @GetUsersEmailAddress() emailAddress: string,
  ): Promise<MailDto[]> {
    const password = await this.userService.getPassword(username);
    return this.mailsService.getMails(emailAddress, password);
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
  async getSyncJob(@GetUsersEmailAddress() emailAddress: string): Promise<SyncJobDto[]> {
    return this.mailsService.getSyncJobs(emailAddress);
  }

  @Post('sync-job')
  async postSyncJob(
    @Body() createSyncJobDto: CreateSyncJobDto,
    @GetUsersEmailAddress() emailAddress: string,
  ): Promise<SyncJobDto[]> {
    return this.mailsService.createSyncJob(createSyncJobDto, emailAddress);
  }

  @Delete('sync-job')
  async deleteSyncJobs(
    @Body() syncJobIds: string[],
    @GetUsersEmailAddress() emailAddress: string,
  ): Promise<SyncJobDto[]> {
    return this.mailsService.deleteSyncJobs(syncJobIds, emailAddress);
  }
}

export default MailsController;
