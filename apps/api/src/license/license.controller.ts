import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import LICENSE_ENDPOINT from '@libs/license/constants/license-endpoints';
import { DEFAULT_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import type SignLicenseDto from '@libs/license/types/sign-license.dto';
import LicenseService from './license.service';
import AppConfigGuard from '../appconfig/appconfig.guard';

@ApiTags(LICENSE_ENDPOINT)
@ApiBearerAuth()
@Controller(LICENSE_ENDPOINT)
class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(DEFAULT_CACHE_TTL_MS)
  async getLicense() {
    return this.licenseService.getLicenseDetails();
  }

  @Post()
  @UseGuards(AppConfigGuard)
  async signLicense(@Body() signLicenseDto: SignLicenseDto) {
    return this.licenseService.signLicense(signLicenseDto);
  }
}

export default LicenseController;
