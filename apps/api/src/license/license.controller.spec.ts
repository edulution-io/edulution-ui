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

import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import LicenseController from './license.controller';
import LicenseService from './license.service';
import GlobalSettingsService from '../global-settings/global-settings.service';

describe(LicenseController.name, () => {
  let controller: LicenseController;
  let licenseService: Record<string, jest.Mock>;

  beforeEach(async () => {
    licenseService = {
      getLicenseDetails: jest.fn().mockResolvedValue({ customerId: 'c-1', isLicenseActive: true }),
      signLicense: jest.fn().mockResolvedValue({ customerId: 'c-1', isLicenseActive: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LicenseController],
      providers: [
        { provide: LicenseService, useValue: licenseService },
        { provide: GlobalSettingsService, useValue: { getAdminGroupsFromCache: jest.fn().mockResolvedValue([]) } },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } },
      ],
    }).compile();

    controller = module.get<LicenseController>(LicenseController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLicense', () => {
    it('should delegate to licenseService.getLicenseDetails', async () => {
      const result = await controller.getLicense();
      expect(licenseService.getLicenseDetails).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ customerId: 'c-1' }));
    });
  });

  describe('signLicense', () => {
    it('should delegate to licenseService.signLicense', async () => {
      const dto = { licenseKey: 'test-key' };
      await controller.signLicense(dto);
      expect(licenseService.signLicense).toHaveBeenCalledWith(dto);
    });
  });
});
