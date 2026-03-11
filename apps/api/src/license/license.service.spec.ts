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
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SchedulerRegistry } from '@nestjs/schedule';
import { HttpStatus } from '@nestjs/common';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import LicenseErrorMessages from '@libs/license/constants/licenseErrorMessages';
import LicenseService from './license.service';
import { License } from './license.schema';

describe(LicenseService.name, () => {
  let service: LicenseService;
  let licenseModel: Record<string, jest.Mock>;
  let mockLicenseServerApi: Record<string, jest.Mock>;

  beforeEach(async () => {
    licenseModel = {
      findOne: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null), select: jest.fn() }),
      updateOne: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ modifiedCount: 1 }) }),
      countDocuments: jest.fn().mockResolvedValue(1),
    };

    mockLicenseServerApi = {
      post: jest.fn().mockRejectedValue(new Error('Network error')),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LicenseService,
        { provide: getModelToken(License.name), useValue: licenseModel },
        {
          provide: getConnectionToken(),
          useValue: {
            db: { listCollections: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }) },
          },
        },
        { provide: JwtService, useValue: { decode: jest.fn().mockReturnValue({}) } },
        {
          provide: CACHE_MANAGER,
          useValue: { del: jest.fn().mockResolvedValue(undefined), get: jest.fn(), set: jest.fn() },
        },
        { provide: SchedulerRegistry, useValue: { addInterval: jest.fn() } },
      ],
    }).compile();

    service = module.get<LicenseService>(LicenseService);
    // eslint-disable-next-line @typescript-eslint/dot-notation
    service['licenseServerApi'] = mockLicenseServerApi as never;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLicenseDetails', () => {
    it('should return license info from database', async () => {
      const mockLicense = { customerId: 'c-1', licenseId: 'l-1', isLicenseActive: true };
      licenseModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockLicense) });

      const result = await service.getLicenseDetails();

      expect(result).toEqual(mockLicense);
    });

    it('should throw INTERNAL_SERVER_ERROR on DB failure', async () => {
      licenseModel.findOne.mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('DB error')) });

      await expect(service.getLicenseDetails()).rejects.toMatchObject({
        message: CommonErrorMessages.DB_ACCESS_FAILED,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('setIsLicenseActive', () => {
    it('should update license active status', async () => {
      await service.setIsLicenseActive(true);

      expect(licenseModel.updateOne).toHaveBeenCalled();
    });

    it('should throw on DB failure', async () => {
      licenseModel.updateOne.mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('DB error')) });

      await expect(service.setIsLicenseActive(false)).rejects.toMatchObject({
        message: CommonErrorMessages.DB_ACCESS_FAILED,
      });
    });
  });

  describe('signLicense', () => {
    it('should throw when license server fails', async () => {
      await expect(service.signLicense({ licenseKey: 'test-key' })).rejects.toMatchObject({
        message: LicenseErrorMessages.LICENSE_SIGNING_FAILED,
      });
    });
  });

  describe('verifyToken', () => {
    it('should throw when verification fails', async () => {
      mockLicenseServerApi.post.mockRejectedValue(new Error('Connection refused'));

      await expect(service.verifyToken({ token: 'bad-token', licenseKey: 'key' } as never)).rejects.toMatchObject({
        message: LicenseErrorMessages.LICENSE_VERIFICATION_FAILED,
      });
    });

    it('should set license active when server returns 200', async () => {
      mockLicenseServerApi.post.mockResolvedValue({ status: 200, data: {} });

      await service.verifyToken({ token: 'valid-token', licenseKey: 'key' } as never);

      expect(licenseModel.updateOne).toHaveBeenCalled();
    });
  });
});
