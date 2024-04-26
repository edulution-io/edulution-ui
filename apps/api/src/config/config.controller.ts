import { UseGuards, Controller, Post, Body, Get, Logger, Put, Delete, Param } from '@nestjs/common';

import { ConfigType } from '../types/schema';
import ConfigService from './config.service';
import LoggerEnum from '../types/logger';

import AuthenticationGuard from '../auth/auth.guard';

@UseGuards(AuthenticationGuard)
@Controller('config')
class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Post()
  createConfig(@Body() feConfig: ConfigType[]) {
    this.configService.insertConfig(feConfig).catch((e) => Logger.log(e, LoggerEnum.MONGODB));
  }

  @Put()
  updateConfig(@Body() feConfig: ConfigType[]) {
    this.configService.updateConfig(feConfig).catch((e) => Logger.log(e, LoggerEnum.MONGODB));
  }

  @Get()
  getConfig() {
    const settingsConfig = this.configService.getConfig();
    return settingsConfig;
  }

  @Delete(':name')
  deleteConfig(@Param('name') name: string) {
    this.configService.deleteConfig(name).catch((e) => Logger.log(e, LoggerEnum.MONGODB));
  }
}

export default ConfigController;
