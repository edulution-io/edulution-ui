import { UseGuards, Controller, Post, Body, Get, Logger, Put, Delete, Param } from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';
import { AppConfigType } from './appconfig.types';
import AppConfigService from './appconfig.service';
import LoggerEnum from '../types/logger';

import AuthenticationGuard from '../auth/auth.guard';

@ApiBearerAuth()
@UseGuards(AuthenticationGuard)
@Controller('appconfig')
class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @Post()
  createConfig(@Body() feConfig: AppConfigType[]) {
    this.appConfigService.insertConfig(feConfig).catch((e) => Logger.log(e, LoggerEnum.MONGODB));
  }

  @Put()
  updateConfig(@Body() feConfig: AppConfigType[]) {
    this.appConfigService.updateConfig(feConfig).catch((e) => Logger.log(e, LoggerEnum.MONGODB));
  }

  @Get()
  getConfig() {
    const settingsConfig = this.appConfigService.getConfig();
    return settingsConfig;
  }

  @Delete(':name')
  deleteConfig(@Param('name') name: string) {
    this.appConfigService.deleteConfig(name).catch((e) => Logger.log(e, LoggerEnum.MONGODB));
  }
}

export default AppConfigController;
