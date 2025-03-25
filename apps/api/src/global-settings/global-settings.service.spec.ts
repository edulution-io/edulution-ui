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

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import CustomHttpException from '@libs/error/CustomHttpException';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import GlobalSettingsService from './global-settings.service';
import { GlobalSettings, GlobalSettingsDocument } from './global-settings.schema';

type MockConnection = {
  db: {
    listCollections: jest.Mock;
    createCollection: jest.Mock;
  };
};

class MockGlobalSettings {
  constructor(public data: any) {}

  save = jest.fn().mockResolvedValue(undefined);

  static countDocuments = jest.fn();

  static findOne = jest.fn();

  static updateOne = jest.fn();
}

describe('GlobalSettingsService', () => {
  let service: GlobalSettingsService;
  let model: Partial<Record<keyof Model<GlobalSettingsDocument>, jest.Mock>> & {
    findOne?: jest.Mock;
    updateOne?: jest.Mock;
    countDocuments?: jest.Mock;
    save?: jest.Mock;
  };

  let connection: MockConnection;

  const mockGlobalSettingsDto: GlobalSettingsDto = {
    auth: {
      mfaEnforcedGroups: [],
    },
  };

  beforeEach(async () => {
    connection = {
      db: {
        listCollections: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
        createCollection: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalSettingsService,
        { provide: getModelToken(GlobalSettings.name), useValue: MockGlobalSettings },
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    service = module.get<GlobalSettingsService>(GlobalSettingsService);
    model = module.get(getModelToken(GlobalSettings.name));
  });

  describe('onModuleInit', () => {
    it('should create collection and insert default settings if none exist', async () => {
      model.countDocuments?.mockResolvedValue(0);

      await service.onModuleInit();

      expect(connection.db.listCollections).toHaveBeenCalledWith({ name: GlobalSettings.name.toLowerCase() });
      expect(connection.db.createCollection).toHaveBeenCalledWith(GlobalSettings.name);
      expect(model.countDocuments).toHaveBeenCalled();
    });

    it('should not create collection or insert if already exists', async () => {
      connection.db.listCollections.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([{}]),
      });
      model.countDocuments?.mockResolvedValue(1);

      await service.onModuleInit();

      expect(connection.db.createCollection).not.toHaveBeenCalled();
    });
  });

  describe('getGlobalSettings', () => {
    it('should return settings with projection', async () => {
      const mockData = { auth: { mfaEnforcedGroups: [] } };
      model.findOne?.mockReturnValue({ lean: () => Promise.resolve(mockData) });

      const result = await service.getGlobalSettings('auth');
      expect(model.findOne).toHaveBeenCalledWith({}, 'auth');
      expect(result).toEqual(mockData);
    });

    it('should return null if error occurs', async () => {
      model.findOne?.mockImplementation(() => {
        throw new Error('Mongo error');
      });

      const result = await service.getGlobalSettings();
      expect(result).toBeNull();
    });
  });

  describe('setGlobalSettings', () => {
    it('should update settings and return result', async () => {
      const mockResult = { acknowledged: true, modifiedCount: 1 };
      model.updateOne?.mockResolvedValue(mockResult);

      const result = await service.setGlobalSettings(mockGlobalSettingsDto);
      expect(model.updateOne).toHaveBeenCalledWith({ singleton: true }, mockGlobalSettingsDto);
      expect(result).toBe(mockResult);
    });

    it('should throw CustomHttpException on update error', async () => {
      model.updateOne?.mockRejectedValue(new Error('Update failed'));

      await expect(service.setGlobalSettings(mockGlobalSettingsDto)).rejects.toThrow(CustomHttpException);
    });
  });
});
