import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import LICENSE_ENDPOINT from '@libs/license/constants/license-endpoints';
import { DEFAULT_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import LicenseService from './license.service';

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
}

export default LicenseController;
