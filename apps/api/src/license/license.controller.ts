import { Controller, Get } from '@nestjs/common';

import LICENSE_ENDPOINT from '@libs/license/constants/license-endpoints';
import LicenseService from './license.service';

@Controller(LICENSE_ENDPOINT)
class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get()
  async getLicense() {
    return this.licenseService.getLicenseDetails();
  }
}

export default LicenseController;
