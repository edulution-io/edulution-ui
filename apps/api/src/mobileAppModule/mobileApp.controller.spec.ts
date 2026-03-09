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
import MobileAppController from './mobileApp.controller';
import MobileAppService from './mobileApp.service';

describe(MobileAppController.name, () => {
  let controller: MobileAppController;
  let mobileAppService: Record<string, jest.Mock>;

  beforeEach(async () => {
    mobileAppService = {
      getAppUserData: jest.fn().mockResolvedValue({ username: 'testuser' }),
      getTotpInfo: jest.fn().mockResolvedValue({ secret: null, createdAt: null }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MobileAppController],
      providers: [{ provide: MobileAppService, useValue: mobileAppService }],
    }).compile();

    controller = module.get<MobileAppController>(MobileAppController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAppUserData', () => {
    it('should delegate to mobileAppService with username and groups', async () => {
      const groups = ['/school/teachers'];
      await controller.getAppUserData('teacher1', groups);
      expect(mobileAppService.getAppUserData).toHaveBeenCalledWith('teacher1', groups);
    });
  });

  describe('getTotpInfo', () => {
    it('should delegate to mobileAppService with username', async () => {
      const result = await controller.getTotpInfo('teacher1');
      expect(mobileAppService.getTotpInfo).toHaveBeenCalledWith('teacher1');
      expect(result).toEqual({ secret: null, createdAt: null });
    });
  });
});
