import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AppIntegrationType } from '@libs/appconfig/types';
import AppConfigService from './appconfig.service';
import mockAppConfigService from './appconfig.service.mock';
import { AppConfig } from './appconfig.schema';

const mockAppConfigModel = {
  insertMany: jest.fn(),
  bulkWrite: jest.fn(),
  find: jest.fn(),
  deleteOne: jest.fn(),
};
describe('AppConfigService', () => {
  let service: AppConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AppConfigService,
          useValue: mockAppConfigService,
        },
        {
          provide: getModelToken(AppConfig.name),
          useValue: mockAppConfigModel,
        },
      ],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('insertConfig', () => {
    it('should successfully insert configs', async () => {
      const appConfigs = [
        {
          name: 'Test',
          icon: 'icon-path',
          appType: AppIntegrationType.EMBEDDED,
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
      expect(mockAppConfigService.insertConfig).toHaveBeenCalledWith(appConfigs);
    });

    it('should throw an error if insertConfig fails', async () => {
      const appConfigs = [
        {
          name: 'Test',
          icon: 'icon-path',
          appType: AppIntegrationType.EMBEDDED,
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
      mockAppConfigService.insertConfig.mockRejectedValue(new Error('Insertion failed'));

      await expect(service.insertConfig(appConfigs)).rejects.toThrow('Insertion failed');
    });
  });

  describe('updateConfig', () => {
    it('should successfully update configs', async () => {
      const appConfigs = [
        {
          name: 'Test',
          icon: 'icon-path',
          appType: AppIntegrationType.EMBEDDED,
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
      expect(mockAppConfigService.updateConfig).toHaveBeenCalledWith(appConfigs);
    });

    it('should throw an error if updateConfig fails', async () => {
      const appConfigs = [
        {
          name: 'Test',
          icon: 'icon-path',
          appType: AppIntegrationType.EMBEDDED,
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
      mockAppConfigService.updateConfig.mockRejectedValue(new Error('Update failed'));

      await expect(service.updateConfig(appConfigs)).rejects.toThrow('Update failed');
    });
  });

  describe('getAppConfigs', () => {
    it('should return app configs', async () => {
      const expectedConfigs = [
        {
          name: 'Test',
          icon: 'icon-path',
          appType: AppIntegrationType.EMBEDDED,
          options: {},
          accessGroups: [
            { id: '1', value: 'group1', name: 'group1', path: 'group1', label: 'group1' },
            { id: '2', value: 'group2', name: 'group2', path: 'group2', label: 'group2' },
          ],
        },
      ];
      const ldapGroups = ['group1', 'group2'];
      mockAppConfigService.getAppConfigs.mockResolvedValue(expectedConfigs);
      const configs = await service.getAppConfigs(ldapGroups);
      expect(configs).toEqual(expectedConfigs);
    });

    it('should throw an error if getAppConfigs fails', async () => {
      const ldapGroups = ['group1', 'group2'];
      mockAppConfigService.getAppConfigs.mockRejectedValue(new Error('Fetch failed'));

      await expect(service.getAppConfigs(ldapGroups)).rejects.toThrow('Fetch failed');
    });

    it('should return an empty array if no configs are found', async () => {
      const ldapGroups = ['non-existent-group'];
      mockAppConfigService.getAppConfigs.mockResolvedValue([]);
      const configs = await service.getAppConfigs(ldapGroups);
      expect(configs).toEqual([]);
    });
  });

  describe('getAppConfigByName', () => {
    it('should return a app config', async () => {
      const appConfigName = 'Test';
      const expectedConfigs = {
        name: appConfigName,
        icon: 'icon-path',
        appType: AppIntegrationType.EMBEDDED,
        options: {},
        accessGroups: [
          { id: '1', value: 'group1', name: 'group1', path: 'group1', label: 'group1' },
          { id: '2', value: 'group2', name: 'group2', path: 'group2', label: 'group2' },
        ],
      };
      mockAppConfigService.getAppConfigByName.mockResolvedValue(expectedConfigs);
      const config = await service.getAppConfigByName(appConfigName);
      expect(config).toEqual(expectedConfigs);
    });

    it('should throw an error if getAppConfigByName fails', async () => {
      const appConfigName = 'Test';
      mockAppConfigService.getAppConfigByName.mockRejectedValue(new Error('Fetch by name failed'));

      await expect(service.getAppConfigByName(appConfigName)).rejects.toThrow('Fetch by name failed');
    });

    it('should return null if the config is not found', async () => {
      const appConfigName = 'NonExistent';
      mockAppConfigService.getAppConfigByName.mockResolvedValue(null);
      const config = await service.getAppConfigByName(appConfigName);
      expect(config).toBeNull();
    });
  });

  describe('deleteConfig', () => {
    it('should delete a config', async () => {
      const configName = 'Test';
      await service.deleteConfig(configName);
      expect(mockAppConfigService.deleteConfig).toHaveBeenCalledWith(configName);
    });

    it('should throw an error if deleteConfig fails', async () => {
      const configName = 'Test';
      mockAppConfigService.deleteConfig.mockRejectedValue(new Error('Deletion failed'));

      await expect(service.deleteConfig(configName)).rejects.toThrow('Deletion failed');
    });
  });
});
