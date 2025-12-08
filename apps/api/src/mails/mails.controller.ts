/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import MAIL_ENDPOINT from '@libs/mail/constants/mail-endpoint';
import { CreateSyncJobDto, MailDto, MailProviderConfigDto, SogoThemeVersionDto, SyncJobDto } from '@libs/mail/types';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import SOGO_THEME from '@libs/mail/constants/sogoTheme';
import GetUsersEmailAddress from '../common/decorators/getUsersEmailAddress.decorator';
import MailsService from './mails.service';
import UsersService from '../users/users.service';
import AdminGuard from '../common/guards/admin.guard';
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
  @UseGuards(AdminGuard)
  async postExternalMailProviderConfig(
    @Body() mailProviderConfig: MailProviderConfigDto,
  ): Promise<MailProviderConfigDto[]> {
    return this.mailsService.postExternalMailProviderConfig(mailProviderConfig);
  }

  @Delete('provider-config/:mailProviderId')
  @UseGuards(AdminGuard)
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

  @Get(SOGO_THEME.VERSION_CHECK_PATH)
  @UseGuards(AdminGuard)
  async checkSogoThemeVersion(): Promise<SogoThemeVersionDto> {
    return this.mailsService.checkSogoThemeVersion();
  }

  @Post(`${SOGO_THEME.VERSION_CHECK_PATH}/update`)
  @UseGuards(AdminGuard)
  async updateSogoThemeManually(): Promise<void> {
    await this.mailsService.updateSogoTheme();
  }
}

export default MailsController;
