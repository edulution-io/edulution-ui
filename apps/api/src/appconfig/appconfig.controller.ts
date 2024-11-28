import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Query, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppConfigDto } from '@libs/appconfig/types';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import AppConfigService from './appconfig.service';
import AppConfigMigrationService from './appconfig.migration.service';
import GetCurrentUserGroups from '../common/decorators/getUserGroups.decorator';
import AppConfigGuard from './appconfig.guard';

@ApiTags(EDU_API_CONFIG_ENDPOINTS.ROOT)
@ApiBearerAuth()
@Controller(EDU_API_CONFIG_ENDPOINTS.ROOT)
class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {
    const appConfigDbMigrationService = new AppConfigMigrationService();
    void appConfigDbMigrationService.onModuleInit();
  }

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

  @Get(EDU_API_CONFIG_ENDPOINTS.PROXYCONFIG)
  @UseGuards(AppConfigGuard)
  getConfigFile(@Query('filePath') filePath: string) {
    return this.appConfigService.getFileAsBase64(filePath);
  }
}

export default AppConfigController;
