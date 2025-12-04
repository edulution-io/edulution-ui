/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import LICENSE_ENDPOINT from '@libs/license/constants/license-endpoints';
import { DEFAULT_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import type SignLicenseDto from '@libs/license/types/sign-license.dto';
import LicenseService from './license.service';
import AdminGuard from '../common/guards/admin.guard';

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
