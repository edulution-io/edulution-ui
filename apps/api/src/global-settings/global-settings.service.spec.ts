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

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, UpdateWriteOpResult } from 'mongoose';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import defaultValues from '@libs/global-settings/constants/defaultValues';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import CustomHttpException from '../common/CustomHttpException';
import GlobalSettingsService from './global-settings.service';
import { GlobalSettings, GlobalSettingsDocument } from './global-settings.schema';
import cacheManagerMock from '../common/mocks/cacheManagerMock';

class MockGlobalSettings {
  constructor(public data: any) {}

  save = jest.fn().mockResolvedValue(undefined);

  static countDocuments = jest.fn();

  static findOne = jest.fn();

  static updateOne = jest.fn();

  static create = jest.fn();
}

describe('GlobalSettingsService', () => {
  let service: GlobalSettingsService;
  let model: Partial<Record<keyof Model<GlobalSettingsDocument>, jest.Mock>> & {
    findOne?: jest.Mock;
    updateOne?: jest.Mock;
    countDocuments?: jest.Mock;
    save?: jest.Mock;
    create?: jest.Mock;
  };

  const mockGlobalAdminSettingsDto: GlobalSettingsDto = defaultValues;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalSettingsService,
        ConfigService,
        { provide: getModelToken(GlobalSettings.name), useValue: MockGlobalSettings },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    service = module.get<GlobalSettingsService>(GlobalSettingsService);
    model = module.get(getModelToken(GlobalSettings.name));
  });

  describe('onModuleInit', () => {
    it('should execute onModuleInit', async () => {
      model.countDocuments?.mockResolvedValue(0);

      await service.onModuleInit();

      expect(model.countDocuments).toHaveBeenCalled();
    });
  });

  describe('getGlobalSettings', () => {
    it('should return settings', async () => {
      const {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        general: { ldap: _, ...generalWithoutLdap },
        ...rest
      } = mockGlobalAdminSettingsDto;
      const cleanedGlobalSettings = {
        ...rest,
        general: generalWithoutLdap,
      };
      model.findOne?.mockReturnValue({ lean: () => Promise.resolve(cleanedGlobalSettings) });

      const result = await service.getGlobalSettings();
      expect(model.findOne).toHaveBeenCalledWith({}, { 'general.ldap': 0 });
      expect(result).toEqual(cleanedGlobalSettings);
    });

    it('should return admin settings', async () => {
      model.findOne?.mockReturnValue({ lean: () => Promise.resolve(mockGlobalAdminSettingsDto) });

      const result = await service.getGlobalAdminSettings();
      expect(model.findOne).toHaveBeenCalledWith({}, { 'general.ldap': 0 });
      expect(result).toEqual(mockGlobalAdminSettingsDto);
    });

    it('should return null if error occurs', async () => {
      model.findOne?.mockImplementation(() => {
        throw new Error('Mongo error');
      });

      await expect(service.getGlobalSettings()).rejects.toThrow(CustomHttpException);
    });
  });

  describe('setGlobalSettings', () => {
    it('should update settings and return result', async () => {
      const mockResult: UpdateWriteOpResult = {
        acknowledged: true,
        modifiedCount: 1,
        matchedCount: 1,
        upsertedCount: 0,
        upsertedId: null,
      };
      model.updateOne?.mockResolvedValue(mockResult);

      const result = await service.setGlobalSettings(mockGlobalAdminSettingsDto);
      expect(model.updateOne).toHaveBeenCalledWith({ singleton: true }, { $set: mockGlobalAdminSettingsDto });
      expect(result).toBe(mockResult);
    });

    it('should throw CustomHttpException on update error', async () => {
      model.updateOne?.mockRejectedValue(new Error('Update failed'));

      await expect(service.setGlobalSettings(mockGlobalAdminSettingsDto)).rejects.toThrow(CustomHttpException);
    });
  });
});
