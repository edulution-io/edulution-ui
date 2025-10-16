/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import LICENSE_ENDPOINT from '@libs/license/constants/license-endpoints';
import { DEFAULT_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import type SignLicenseDto from '@libs/license/types/sign-license.dto';
import LicenseService from './license.service';
import AdminGuard from '../appconfig/admin.guard';

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
  @UseGuards(AdminGuard)
  async signLicense(@Body() signLicenseDto: SignLicenseDto) {
    return this.licenseService.signLicense(signLicenseDto);
  }
}

export default LicenseController;
