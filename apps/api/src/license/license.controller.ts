import { Controller, Get } from '@nestjs/common';

import LICENSE_ENDPOINT from '@libs/license/constants/license-endpoints';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import LicenseService from './license.service';

@ApiTags(LICENSE_ENDPOINT)
@ApiBearerAuth()
@Controller(LICENSE_ENDPOINT)
class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get()
  async getLicense() {
    return this.licenseService.getLicenseDetails();
  }
}

export default LicenseController;
