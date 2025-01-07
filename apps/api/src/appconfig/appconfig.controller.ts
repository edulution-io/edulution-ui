import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppConfigDto } from '@libs/appconfig/types';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import AppConfigService from './appconfig.service';
import GetCurrentUserGroups from '../common/decorators/getUserGroups.decorator';
import AppConfigGuard from './appconfig.guard';

@ApiTags(EDU_API_CONFIG_ENDPOINTS.ROOT)
@ApiBearerAuth()
@Controller(EDU_API_CONFIG_ENDPOINTS.ROOT)
class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @Post()
  @UseGuards(AppConfigGuard)
  createConfig(@Body() appConfigDto: AppConfigDto) {
    return this.appConfigService.insertConfig(appConfigDto);
  }

  @Put()
  @UseGuards(AppConfigGuard)
  updateConfig(@Body() appConfigDto: AppConfigDto[]) {
    return this.appConfigService.updateConfig(appConfigDto);
  }

  @Get()
  getAppConfigs(@GetCurrentUserGroups() ldapGroups: string[]) {
    return this.appConfigService.getAppConfigs(ldapGroups);
  }

  @Delete(':name')
  @UseGuards(AppConfigGuard)
  deleteConfig(@Param('name') name: string) {
    return this.appConfigService.deleteConfig(name);
  }

  @Get(EDU_API_CONFIG_ENDPOINTS.PROXYCONFIG)
  @UseGuards(AppConfigGuard)
  getConfigFile(@Query('filePath') filePath: string) {
    return this.appConfigService.getFileAsBase64(filePath);
  }
}

export default AppConfigController;
