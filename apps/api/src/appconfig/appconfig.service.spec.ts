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
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { readFileSync } from 'fs';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type PatchConfigDto from '@libs/common/types/patchConfigDto';
import AppConfigErrorMessages from '@libs/appconfig/types/appConfigErrorMessages';
import { HttpStatus } from '@nestjs/common';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import CustomHttpException from '../common/CustomHttpException';
import AppConfigService from './appconfig.service';
import { AppConfig } from './appconfig.schema';
import { mockAppConfig, mockAppConfigModel, mockLdapGroup } from './appconfig.mock';
import FilesystemService from '../filesystem/filesystem.service';
import mockFilesystemService from '../filesystem/filesystem.service.mock';
import GlobalSettingsService from '../global-settings/global-settings.service';

jest.mock('fs');

jest.mock('@libs/user/utils/getIsAdmin', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockConnection = {
  db: {
    listCollections: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    }),
    createCollection: jest.fn().mockResolvedValue({}),
  },
};

const globalSettingsServiceMock = {
  setGlobalSettings: jest.fn(),
  getGlobalSettings: jest.fn(),
  getAdminGroupsFromCache: jest.fn(),
};

describe('AppConfigService', () => {
  let service: AppConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppConfigService,
        {
          provide: getModelToken(AppConfig.name),
          useValue: mockAppConfigModel,
        },
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: FilesystemService, useValue: mockFilesystemService },
        { provide: GlobalSettingsService, useValue: globalSettingsServiceMock },
      ],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
  });

  describe('insertConfig', () => {
    it('should successfully insert configs', async () => {
      jest.spyOn(service, 'getAppConfigs').mockResolvedValue([mockAppConfig]);
      await service.insertConfig(mockAppConfig, mockLdapGroup);
      expect(mockAppConfigModel.create).toHaveBeenCalledWith(mockAppConfig);
    });
  });

  describe('updateConfig', () => {
    it('should successfully update configs', async () => {
      mockAppConfigModel.updateOne.mockResolvedValue({});
      jest.spyOn(service, 'getAppConfigs').mockResolvedValue([mockAppConfig]);

      const result = await service.updateConfig(mockAppConfig.name, mockAppConfig, mockLdapGroup);

      expect(mockAppConfigModel.bulkWrite).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            updateOne: {
              filter: { name: mockAppConfig.name },
              update: {
                $set: {
                  icon: mockAppConfig.icon,
                  appType: mockAppConfig.appType,
                  options: mockAppConfig.options,
                  accessGroups: mockAppConfig.accessGroups,
                  extendedOptions: mockAppConfig.extendedOptions,
                  position: mockAppConfig.position,
                },
              },
              upsert: true,
            },
          },
        ]),
        { ordered: true },
      );
      expect(service.getAppConfigs).toHaveBeenCalledWith(mockLdapGroup);
      expect(result).toEqual([mockAppConfig]);
    });
  });

  describe('patchSingleFieldInConfig', () => {
    it('should update the configuration and return updated configs', async () => {
      const name = 'testConfig';
      const patchConfigDto: PatchConfigDto = { field: 'extendedOptions', value: 'newValue' };

      mockAppConfigModel.updateOne.mockResolvedValue({});
      jest.spyOn(service, 'getAppConfigs').mockResolvedValue([mockAppConfig]);

      const result = await service.patchSingleFieldInConfig(name, patchConfigDto, mockLdapGroup);

      expect(mockAppConfigModel.updateOne).toHaveBeenCalledWith(
        { name },
        { $set: { [patchConfigDto.field]: patchConfigDto.value } },
      );
      expect(service.getAppConfigs).toHaveBeenCalledWith(mockLdapGroup);
      expect(result).toEqual([mockAppConfig]);
    });

    it('should throw CustomHttpException if updateOne fails', async () => {
      const name = 'testConfig';
      const patchConfigDto: PatchConfigDto = { field: 'extendedOptions', value: 'newValue' };

      mockAppConfigModel.updateOne.mockRejectedValue(new Error('Database error'));

      await expect(service.patchSingleFieldInConfig(name, patchConfigDto, mockLdapGroup)).rejects.toThrow(
        new CustomHttpException(
          AppConfigErrorMessages.WriteAppConfigFailed,
          HttpStatus.SERVICE_UNAVAILABLE,
          undefined,
          AppConfigService.name,
        ),
      );
    });
  });

  describe('getAppConfigs', () => {
    it('should return app configs (non-admin strips OnlyOffice secret)', async () => {
      const ldapGroups = ['group1', 'group2']; // Non-Admin

      const { [ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET]: omit, ...safeExtendedOptions } =
        (mockAppConfig.extendedOptions ?? {}) as Record<string, unknown>;
      void omit;
      const expected = [
        {
          name: mockAppConfig.name,
          icon: mockAppConfig.icon,
          appType: mockAppConfig.appType,
          options: { url: mockAppConfig.options.url },
          accessGroups: [],
          extendedOptions: safeExtendedOptions,
          position: mockAppConfig.position,
        },
      ];

      const configs = await service.getAppConfigs(ldapGroups);
      expect(configs).toEqual(expected);
      expect(configs[0].extendedOptions).not.toHaveProperty(ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET);
    });
    it('should include OnlyOffice secret for admin', async () => {
      (getIsAdmin as jest.Mock).mockReturnValue(true);

      const configs = await service.getAppConfigs(['irrelevant']);

      expect(configs).toHaveLength(1);
      expect(configs[0]).toMatchObject({
        name: mockAppConfig.name,
        icon: mockAppConfig.icon,
        appType: mockAppConfig.appType,
        options: mockAppConfig.options,
        accessGroups: mockAppConfig.accessGroups,
        position: mockAppConfig.position,
      });
      if (mockAppConfig.extendedOptions) {
        expect(configs[0].extendedOptions).toHaveProperty(
          ExtendedOptionKeys.ONLY_OFFICE_URL,
          mockAppConfig.extendedOptions[ExtendedOptionKeys.ONLY_OFFICE_URL],
        );
        expect(configs[0].extendedOptions).toHaveProperty(
          ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET,
          mockAppConfig.extendedOptions[ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET],
        );
      }
    });
  });

  describe('getAppConfigByName', () => {
    it('should return an app config', async () => {
      const appConfigName = 'Test';
      const expectedConfig = {
        name: appConfigName,
        icon: 'icon-path',
        appType: APP_INTEGRATION_VARIANT.NATIVE,
        options: {},
        accessGroups: [
          { id: '1', value: 'group1', name: 'group1', path: 'group1', label: 'group1' },
          { id: '2', value: 'group2', name: 'group2', path: 'group2', label: 'group2' },
        ],
        extendedOptions: {
          [ExtendedOptionKeys.ONLY_OFFICE_URL]: 'https://example.com/2/',
          [ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET]: 'secret-key',
        },
      };

      jest.spyOn(mockAppConfigModel, 'findOne').mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue(expectedConfig),
      });

      const config = await service.getAppConfigByName(appConfigName);

      expect(config).toEqual(expectedConfig);
      expect(mockAppConfigModel.findOne).toHaveBeenCalledWith({ name: appConfigName });
    });
  });

  describe('deleteConfig', () => {
    it('should delete a config', async () => {
      const configName = 'Test';
      jest.spyOn(service, 'getAppConfigs').mockResolvedValue([mockAppConfig]);

      mockAppConfigModel.bulkWrite.mockResolvedValue({});

      jest.spyOn(FilesystemService, 'checkIfFileExist').mockResolvedValueOnce(false).mockResolvedValueOnce(false);
      jest.spyOn(FilesystemService, 'deleteFile').mockResolvedValue();
      jest.spyOn(FilesystemService, 'deleteDirectories').mockResolvedValue();

      const result = await service.deleteConfig(configName, mockLdapGroup);

      expect(mockAppConfigModel.bulkWrite).toHaveBeenCalledWith(
        expect.arrayContaining([
          { deleteOne: { filter: { name: configName } } },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          expect.objectContaining({ updateMany: expect.any(Object) }),
        ]),
        { ordered: true },
      );

      expect(result).toEqual([mockAppConfig]);
    });
  });

  describe('getFileAsBase64', () => {
    it('should return base64 encoded string of the file', () => {
      const filePath = 'path/to/testfile.txt';
      const fileContent = 'Test file content';
      const base64Content = Buffer.from(fileContent).toString('base64');

      (readFileSync as jest.Mock).mockReturnValue(Buffer.from(fileContent));

      const result = service.getFileAsBase64(filePath);
      expect(result).toEqual(base64Content);
      expect(readFileSync).toHaveBeenCalledWith(filePath);
    });
  });
});
