import { Controller, Post, Body, Get, Logger, Put, Delete, Param } from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';
import { AppConfigDto } from './appconfig.types';
import AppConfigService from './appconfig.service';
import LoggerEnum from '../types/logger';

@ApiBearerAuth()
@Controller('appconfig')
class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @Post()
  createConfig(@Body() appConfigDto: AppConfigDto[]) {
    this.appConfigService.insertConfig(appConfigDto).catch((e) => Logger.log(e, LoggerEnum.MONGODB));
  }

  @Put()
  updateConfig(@Body() appConfigDto: AppConfigDto[]) {
    this.appConfigService.updateConfig(appConfigDto).catch((e) => Logger.log(e, LoggerEnum.MONGODB));
  }

  @Get()
  getAppConfigs() {
    const appConfig = this.appConfigService.getAppConfigs();
    return appConfig;
  }

  @Delete(':name')
  deleteConfig(@Param('name') name: string) {
    this.appConfigService.deleteConfig(name).catch((e) => Logger.log(e, LoggerEnum.MONGODB));
  }
}

export default AppConfigController;
