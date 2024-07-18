import { Controller, Body, Get, Post, Delete, HttpStatus } from '@nestjs/common';
import LicenseDto from '@libs/license/types/license.dto';
import RemoveLicenseDto from '@libs/license/types/remove-license.dto';
import LicenseErrorMessages from '@libs/license/license-error-messages';
import CustomHttpException from '@libs/error/CustomHttpException';
import { LICENSE_ENDPOINT, LICENSE_MANAGEMENT_ENDPOINT } from '@libs/license/types/license-endpoints';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import LicenseService from './license.service';

@Controller(LICENSE_ENDPOINT)
class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Post()
  async addLicense(@Body() addLicenseDto: LicenseDto) {
    if (!this.licenseService.isLicenseObject(addLicenseDto)) {
      throw new CustomHttpException(LicenseErrorMessages.NotALicenseError, HttpStatus.BAD_REQUEST);
    }

    await this.licenseService.addLicense(addLicenseDto);
  }

  @Get()
  async getLicenses(@GetCurrentUsername() username: string) {
    return this.licenseService.getLicensesDetails(username);
  }

  @Delete(LICENSE_MANAGEMENT_ENDPOINT)
  async removeLicenses(@Body() removeLicenseDto: RemoveLicenseDto) {
    const { licenseIds } = removeLicenseDto;
    await this.licenseService.removeLicenses(licenseIds);
  }

  @Get(LICENSE_MANAGEMENT_ENDPOINT)
  async getAllLicenses() {
    return this.licenseService.getLicensesDetails();
  }
}

export default LicenseController;
