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
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import MobileAppService from './mobileApp.service';
import UsersService from '../users/users.service';
import GlobalSettingsService from '../global-settings/global-settings.service';
import LmnApiService from '../lmnApi/lmnApi.service';
import WebdavSharesService from '../webdav/shares/webdav-shares.service';

describe(MobileAppService.name, () => {
  let service: MobileAppService;
  let usersService: Record<string, jest.Mock>;
  let globalSettingsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    usersService = {
      findOne: jest.fn().mockResolvedValue({ username: 'testuser', firstName: 'Test', lastName: 'User' }),
    };

    globalSettingsService = {
      getGlobalSettings: jest.fn().mockResolvedValue({
        general: { deploymentTarget: DEPLOYMENT_TARGET.LINUXMUSTER },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobileAppService,
        { provide: UsersService, useValue: usersService },
        { provide: GlobalSettingsService, useValue: globalSettingsService },
        {
          provide: LmnApiService,
          useValue: {
            getLmnApiToken: jest.fn().mockResolvedValue('mock-token'),
            getUser: jest.fn().mockResolvedValue({}),
          },
        },
        { provide: WebdavSharesService, useValue: { findAllWebdavShares: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    service = module.get<MobileAppService>(MobileAppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAppUserData', () => {
    it('should return user data object', async () => {
      const result = await service.getAppUserData('testuser', ['/school/teachers']);
      expect(result).toBeDefined();
      expect(usersService.findOne).toHaveBeenCalledWith('testuser');
    });

    it('should return empty object on error', async () => {
      usersService.findOne.mockRejectedValue(new Error('User not found'));

      const result = await service.getAppUserData('baduser', []);
      expect(result).toEqual({});
    });
  });

  describe('getTotpInfo', () => {
    it('should return null values when user has no MFA enabled', async () => {
      usersService.findOne.mockResolvedValue({ username: 'testuser', mfaEnabled: false });

      const result = await service.getTotpInfo('testuser');

      expect(result).toEqual({ secret: null, createdAt: null });
    });

    it('should return totp info when MFA is enabled', async () => {
      const createdAt = new Date();
      usersService.findOne.mockResolvedValue({
        username: 'testuser',
        mfaEnabled: true,
        totpSecret: 'JBSWY3DPEHPK3PXP',
        totpCreatedAt: createdAt,
      });

      const result = await service.getTotpInfo('testuser');

      expect(result).toEqual({ secret: 'JBSWY3DPEHPK3PXP', createdAt });
    });

    it('should return null values when user not found', async () => {
      usersService.findOne.mockResolvedValue(null);

      const result = await service.getTotpInfo('missing');

      expect(result).toEqual({ secret: null, createdAt: null });
    });
  });
});
