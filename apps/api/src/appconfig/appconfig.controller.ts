import { Body, Controller, Delete, Get, Logger, Param, Post, Put, UseGuards } from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';
import { AppConfigDto } from '@libs/appconfig/types';
import { EDU_API_CONFIG_ENDPOINT } from '@libs/appconfig/constants';
import AppConfigService from './appconfig.service';
import { GetCurrentUserGroups } from '../common/decorators/getUser.decorator';
import AppConfigGuard from './appconfig.guard';

@ApiBearerAuth()
@Controller(EDU_API_CONFIG_ENDPOINT)
class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @Post()
  @UseGuards(AppConfigGuard)
  createConfig(@Body() appConfigDto: AppConfigDto[]) {
    this.appConfigService.insertConfig(appConfigDto).catch((e) => Logger.error(e, AppConfigController.name));
  }

  @Put()
  @UseGuards(AppConfigGuard)
  updateConfig(@Body() appConfigDto: AppConfigDto[]) {
    this.appConfigService.updateConfig(appConfigDto).catch((e) => Logger.error(e, AppConfigController.name));
  }

  @Get()
  getAppConfigs(@GetCurrentUserGroups() ldapGroups: string[]) {
    return this.appConfigService.getAppConfigs(ldapGroups);
  }

  @Delete(':name')
  @UseGuards(AppConfigGuard)
  deleteConfig(@Param('name') name: string) {
    this.appConfigService.deleteConfig(name).catch((e) => Logger.error(e, AppConfigController.name));
  }
}

export default AppConfigController;
