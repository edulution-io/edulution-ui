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

import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { UpdateWriteOpResult } from 'mongoose';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import defaultValues from '@libs/global-settings/constants/defaultValues';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import GlobalSettingsController from './global-settings.controller';
import GlobalSettingsService from './global-settings.service';
import AdminGuard from '../common/guards/admin.guard';
import cacheManagerMock from '../common/mocks/cacheManagerMock';

const mockedGlobalSettingsDto: GlobalSettingsDto = defaultValues;

const mockedGlobalSettingsDbResponse = {
  _id: '123',
  auth: { mfaEnforcedGroups: [] },
  schemaVersion: 1,
  singleton: true,
  __v: 0,
} as unknown as Awaited<ReturnType<GlobalSettingsService['getGlobalSettings']>>;

const mockedMongooseUpdateWriteOpResult: UpdateWriteOpResult = {
  acknowledged: true,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0,
  upsertedId: null,
};

describe('GlobalSettingsController', () => {
  let controller: GlobalSettingsController;
  let service: GlobalSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GlobalSettingsController],
      providers: [
        ConfigService,
        {
          provide: GlobalSettingsService,
          useValue: {
            getGlobalSettings: jest.fn(),
            setGlobalSettings: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({
        canActivate: jest.fn((_context: ExecutionContext) => true),
      })
      .compile();

    controller = module.get<GlobalSettingsController>(GlobalSettingsController);
    service = module.get<GlobalSettingsService>(GlobalSettingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getGlobalSettings', () => {
    it('should return global settings', async () => {
      jest.spyOn(service, 'getGlobalSettings').mockResolvedValue(mockedGlobalSettingsDbResponse);

      expect(await controller.getGlobalSettings()).toBe(mockedGlobalSettingsDbResponse);
      expect(service.getGlobalSettings).toHaveBeenCalledWith();
    });

    it('should return projected global settings', async () => {
      jest.spyOn(service, 'getGlobalSettings').mockResolvedValue(mockedGlobalSettingsDbResponse);

      expect(await controller.getGlobalSettings()).toBe(mockedGlobalSettingsDbResponse);
      expect(service.getGlobalSettings).toHaveBeenCalledWith();
    });
  });

  describe('setAppSettings', () => {
    it('should set global settings', async () => {
      jest.spyOn(service, 'setGlobalSettings').mockResolvedValue(mockedMongooseUpdateWriteOpResult);

      await controller.setGlobalSettings(mockedGlobalSettingsDto);
      expect(service.setGlobalSettings).toHaveBeenCalledWith(mockedGlobalSettingsDto);
    });
  });
});
