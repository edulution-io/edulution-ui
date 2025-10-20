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
import AppConfigController from './appconfig.controller';
import AppConfigService from './appconfig.service';
import { AppConfig } from './appconfig.schema';
import { mockAppConfig, mockAppConfigModel, mockAppConfigService, mockLdapGroup } from './appconfig.mock';
import FilesystemService from '../filesystem/filesystem.service';
import mockFilesystemService from '../filesystem/filesystem.service.mock';
import GlobalSettingsService from '../global-settings/global-settings.service';

jest.mock('./appconfig.service');

describe('AppConfigController', () => {
  let controller: AppConfigController;
  let service: AppConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppConfigController],
      providers: [
        {
          provide: AppConfigService,
          useValue: mockAppConfigService,
        },
        {
          provide: getModelToken(AppConfig.name),
          useValue: mockAppConfigModel,
        },
        { provide: FilesystemService, useValue: mockFilesystemService },
        { provide: GlobalSettingsService, useValue: { getAdminGroupsFromCache: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AppConfigController>(AppConfigController);
    service = module.get<AppConfigService>(AppConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('createConfig', () => {
    it('should call insertConfig method of appConfigService with correct arguments', () => {
      void controller.createConfig(mockLdapGroup, mockAppConfig);
      expect(service.insertConfig).toHaveBeenCalledWith(mockAppConfig, mockLdapGroup);
    });

    it('should call updateConfig method of appConfigService with correct arguments', () => {
      void controller.updateConfig(mockAppConfig.name, mockAppConfig, mockLdapGroup);
      expect(service.updateConfig).toHaveBeenCalledWith(mockAppConfig.name, mockAppConfig, mockLdapGroup);
    });
  });

  describe('getAppConfigs', () => {
    it('should call getAppConfigs method of appConfigService', async () => {
      await controller.getAppConfigs(mockLdapGroup);
      expect(service.getAppConfigs).toHaveBeenCalled();
    });
  });

  describe('deleteConfig', () => {
    it('should call deleteConfig method of appConfigService with correct arguments', () => {
      void controller.deleteConfig(mockAppConfig.name, mockLdapGroup);
      expect(service.deleteConfig).toHaveBeenCalledWith(mockAppConfig.name, mockLdapGroup);
    });
  });

  describe('getConfigFile', () => {
    it('should return base64 string from AppConfigService', () => {
      const filePath = 'test/path/to/file.txt';
      const base64Content = 'dGVzdCBmaWxlIGNvbnRlbnQ=';

      jest.spyOn(service, 'getFileAsBase64').mockReturnValue(base64Content);

      const result = controller.getConfigFile(filePath);

      expect(service.getFileAsBase64).toHaveBeenCalledWith(filePath);
      expect(result).toEqual(base64Content);
    });

    it('should throw an error if AppConfigService throws an error', () => {
      const filePath = 'test/path/to/invalidfile.txt';

      jest.spyOn(service, 'getFileAsBase64').mockImplementation(() => {
        throw new Error('File not found');
      });

      expect(() => {
        controller.getConfigFile(filePath);
      }).toThrow('File not found');
    });
  });
});

export default mockAppConfigService;
