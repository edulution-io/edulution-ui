import { Controller, Body, Get, Post, HttpStatus } from '@nestjs/common';
import LicenseDto from '@libs/license/types/license.dto';
import LicenseErrorMessages from '@libs/license/license-error-messages';
import CustomHttpException from '@libs/error/CustomHttpException';
import { LICENSE_ENDPOINT } from '@libs/license/types/license-endpoints';
// import GetCurrentUser from '../common/decorators/getUser.decorator';
import LicenseService from './license.service';
// import JWTUser from '../types/JWTUser';

@Controller(LICENSE_ENDPOINT)
class LicenseController {
  constructor(
    private readonly licenseService: LicenseService,
    // private readonly licensingOverviewService: LicensingOverviewService,
  ) {}

  @Post()
  async addLicense(@Body() addLicenseDto: LicenseDto, /*@GetCurrentUser() user: JWTUser*/) {
    if (!this.licenseService.isLicenseObject(addLicenseDto)) {
      throw new CustomHttpException(LicenseErrorMessages.NotALicenseError, HttpStatus.BAD_REQUEST);
    }

    await this.licenseService.addLicense(addLicenseDto/*, user*/);
  }

  @Get()
  async getLicenses(/*@GetCurrentUser() user: JWTUser*/) {
    return await this.licenseService.getLicensesDetails();
  }
}

export default LicenseController;
