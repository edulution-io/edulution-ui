import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';
import { AppConfig } from './appconfig.types';
import AppConfigService from './appconfig.service';

@ApiBearerAuth()
@Controller('appconfig')
class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @Post()
  createConfig(@Body() appConfigDto: AppConfig[]) {
    this.appConfigService.insertConfig(appConfigDto).catch((e) => Logger.log(e, AppConfigController.name));
  }

  @Put()
  updateConfig(@Body() appConfigDto: AppConfig[]) {
    this.appConfigService.updateConfig(appConfigDto).catch((e) => Logger.log(e, AppConfigController.name));
  }

  @Get()
  getAppConfigs() {
    return this.appConfigService.getAppConfigs();
  }

  @Delete(':name')
  deleteConfig(@Param('name') name: string) {
    this.appConfigService.deleteConfig(name).catch((e) => Logger.log(e, AppConfigController.name));
  }
}

export default AppConfigController;
