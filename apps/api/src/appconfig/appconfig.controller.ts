import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppConfigDto } from '@libs/appconfig/types';
import type PatchConfigDto from '@libs/common/types/patchConfigDto';
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
  createConfig(@GetCurrentUserGroups() ldapGroups: string[], @Body() appConfigDto: AppConfigDto) {
    return this.appConfigService.insertConfig(appConfigDto, ldapGroups);
  }

  @Put(':name')
  @UseGuards(AppConfigGuard)
  updateConfig(
    @Param('name') name: string,
    @Body() appConfigDto: AppConfigDto,
    @GetCurrentUserGroups() ldapGroups: string[],
  ) {
    return this.appConfigService.updateConfig(name, appConfigDto, ldapGroups);
  }

  @Patch(':name')
  @UseGuards(AppConfigGuard)
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

  @Delete(':name')
  @UseGuards(AppConfigGuard)
  deleteConfig(@Param('name') name: string, @GetCurrentUserGroups() ldapGroups: string[]) {
    return this.appConfigService.deleteConfig(name, ldapGroups);
  }

  @Get(EDU_API_CONFIG_ENDPOINTS.PROXYCONFIG)
  @UseGuards(AppConfigGuard)
  getConfigFile(@Query('filePath') filePath: string) {
    return this.appConfigService.getFileAsBase64(filePath);
  }
}

export default AppConfigController;
