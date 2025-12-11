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

import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import type PatchConfigDto from '@libs/common/types/patchConfigDto';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import AppConfigService from './appconfig.service';
import GetCurrentUserGroups from '../common/decorators/getCurrentUserGroups.decorator';
import AdminGuard from '../common/guards/admin.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags(EDU_API_CONFIG_ENDPOINTS.ROOT)
@ApiBearerAuth()
@Controller(EDU_API_CONFIG_ENDPOINTS.ROOT)
class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @Post()
  @UseGuards(AdminGuard)
  createConfig(@GetCurrentUserGroups() ldapGroups: string[], @Body() appConfigDto: AppConfigDto) {
    return this.appConfigService.insertConfig(appConfigDto, ldapGroups);
  }

  @Put(':name')
  @UseGuards(AdminGuard)
  updateConfig(
    @Param('name') name: string,
    @Body() appConfigDto: AppConfigDto,
    @GetCurrentUserGroups() ldapGroups: string[],
  ) {
    return this.appConfigService.updateConfig(name, appConfigDto, ldapGroups);
  }

  @Patch(':name')
  @UseGuards(AdminGuard)
  patchConfig(
    @Param('name') name: string,
    @Body() patchConfigDto: PatchConfigDto,
    @GetCurrentUserGroups() ldapGroups: string[],
  ) {
    return this.appConfigService.patchSingleFieldInConfig(name, patchConfigDto, ldapGroups);
  }

  @Get()
  getAppConfigs(@GetCurrentUserGroups() ldapGroups: string[]) {
    return this.appConfigService.getAppConfigs(ldapGroups);
  }

  @Public()
  @Get('public')
  getPublicAppConfigs() {
    return this.appConfigService.getPublicAppConfigs();
  }

  @Public()
  @Get('public/:name')
  getPublicAppConfigByName(@Param('name') name: string) {
    return this.appConfigService.getPublicAppConfigByName(name);
  }

  @Delete(':name')
  @UseGuards(AdminGuard)
  deleteConfig(@Param('name') name: string, @GetCurrentUserGroups() ldapGroups: string[]) {
    return this.appConfigService.deleteConfig(name, ldapGroups);
  }

  @Get(EDU_API_CONFIG_ENDPOINTS.PROXYCONFIG)
  @UseGuards(AdminGuard)
  getConfigFile(@Query('filePath') filePath: string) {
    return this.appConfigService.getFileAsBase64(filePath);
  }
}

export default AppConfigController;
