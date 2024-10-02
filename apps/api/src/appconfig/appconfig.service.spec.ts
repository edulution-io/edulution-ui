import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { readFileSync } from 'fs';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import AppConfigService from './appconfig.service';
import { AppConfig } from './appconfig.schema';

jest.mock('fs');

const mockAppConfigModel = {
  insertMany: jest.fn(),
  bulkWrite: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  deleteOne: jest.fn(),
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
      ],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
  });

  describe('insertConfig', () => {
    it('should successfully insert configs', async () => {
      const appConfigs = [
        {
          name: 'Test',
          icon: 'icon-path',
          appType: APP_INTEGRATION_VARIANT.EMBEDDED,
          options: {
            url: 'test/path',
            apiKey: '123456789',
          },
          accessGroups: [
            { id: '1', value: 'group1', name: 'group1', path: 'group1', label: 'group1' },
            { id: '2', value: 'group2', name: 'group2', path: 'group2', label: 'group2' },
          ],
        },
      ];
      await service.insertConfig(appConfigs);
      expect(mockAppConfigModel.insertMany).toHaveBeenCalledWith(appConfigs);
    });
  });

  describe('updateConfig', () => {
    it('should successfully update configs', async () => {
      const appConfigs = [
        {
          name: 'Test',
          icon: 'icon-path',
          appType: APP_INTEGRATION_VARIANT.EMBEDDED,
          options: {
            url: 'test/path',
            apiKey: '123456789',
          },
          accessGroups: [
            { id: '1', value: 'group1', name: 'group1', path: 'group1', label: 'group1' },
            { id: '2', value: 'group2', name: 'group2', path: 'group2', label: 'group2' },
          ],
        },
      ];

      await service.updateConfig(appConfigs);
      expect(mockAppConfigModel.bulkWrite).toHaveBeenCalledWith(expect.any(Array)); // Oder detailliertere Prüfung
    });
  });

  describe('getAppConfigs', () => {
    it('should return app configs', async () => {
      const appConfigObjects = [
        {
          name: 'Test',
          icon: 'icon-path',
          appType: APP_INTEGRATION_VARIANT.EMBEDDED,
          options: { url: 'test/path' },
          accessGroups: [
            { id: '1', value: 'group1', name: 'group1', path: 'group1', label: 'group1' },
            { id: '2', value: 'group2', name: 'group2', path: 'group2', label: 'group2' },
          ],
          extendedOptions: [],
        },
      ];

      const expectedConfigs = appConfigObjects.map((config) => ({
        name: config.name,
        icon: config.icon,
        appType: config.appType,
        options: { url: config.options.url ?? '' },
        accessGroups: [],
        extendedOptions: config.extendedOptions ?? [],
      }));

      const ldapGroups = ['group1', 'group2'];

      mockAppConfigModel.find.mockResolvedValue(appConfigObjects);

      const configs = await service.getAppConfigs(ldapGroups);

      expect(configs).toEqual(expectedConfigs);
    });
  });

  describe('getAppConfigByName', () => {
    it('should return an app config', async () => {
      const appConfigName = 'Test';
      const expectedConfig = {
        name: appConfigName,
        icon: 'icon-path',
        appType: APP_INTEGRATION_VARIANT.EMBEDDED,
        options: {},
        accessGroups: [
          { id: '1', value: 'group1', name: 'group1', path: 'group1', label: 'group1' },
          { id: '2', value: 'group2', name: 'group2', path: 'group2', label: 'group2' },
        ],
      };

      mockAppConfigModel.findOne.mockResolvedValue(expectedConfig);

      const config = await service.getAppConfigByName(appConfigName);

      expect(config).toEqual(expectedConfig);
      expect(mockAppConfigModel.findOne).toHaveBeenCalledWith({ name: appConfigName });
    });
  });

  describe('deleteConfig', () => {
    it('should delete a config', async () => {
      const configName = 'Test';

      await service.deleteConfig(configName);

      expect(mockAppConfigModel.deleteOne).toHaveBeenCalledWith({ name: configName });
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
