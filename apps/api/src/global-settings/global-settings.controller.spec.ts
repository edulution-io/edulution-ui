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

import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { UpdateWriteOpResult } from 'mongoose';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import defaultValues from '@libs/global-settings/constants/defaultValues';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import GlobalSettingsController from './global-settings.controller';
import GlobalSettingsService from './global-settings.service';
import AppConfigGuard from '../appconfig/appconfig.guard';
import cacheManagerMock from '../common/mocks/cacheManagerMock';
import FilesystemService from '../filesystem/filesystem.service';

const mockedGlobalSettingsDto: GlobalSettingsDto = defaultValues;

const mockFs = {
  savePublicAsset: jest.fn(),
  deletePublicByBasename: jest.fn(),
  servePublicAssert: jest.fn(),
  resolvePublicAssetAbsolutePath: jest.fn(),
};

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
        {
          provide: GlobalSettingsService,
          useValue: {
            getGlobalSettings: jest.fn(),
            setGlobalSettings: jest.fn(),
          },
        },
        { provide: FilesystemService, useValue: mockFs },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    })
      .overrideGuard(AppConfigGuard)
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

      await expect(controller.getGlobalSettings(undefined)).resolves.toBe(mockedGlobalSettingsDbResponse);

      expect(service.getGlobalSettings).toHaveBeenCalledWith(undefined);
    });

    it('should return projected global settings', async () => {
      jest.spyOn(service, 'getGlobalSettings').mockResolvedValue(mockedGlobalSettingsDbResponse);

      await expect(controller.getGlobalSettings('schoolInfo')).resolves.toBe(mockedGlobalSettingsDbResponse);

      expect(service.getGlobalSettings).toHaveBeenCalledWith('schoolInfo');
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
