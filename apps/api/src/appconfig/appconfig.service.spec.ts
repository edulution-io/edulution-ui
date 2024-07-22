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
          accessGroups: ['group1', 'group2'],
        },
      ];
      await service.insertConfig(appConfigs);
      expect(mockAppConfigService.insertConfig).toHaveBeenCalledWith(appConfigs);
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
          accessGroups: ['group1', 'group2'],
        },
      ];
      await service.updateConfig(appConfigs);
      expect(mockAppConfigService.updateConfig).toHaveBeenCalledWith(appConfigs);
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
        },
      ];
      mockAppConfigService.getAppConfigs.mockResolvedValue(expectedConfigs);
      const configs = await service.getAppConfigs();
      expect(configs).toEqual(expectedConfigs);
    });
  });

  describe('deleteConfig', () => {
    it('should delete a config', async () => {
      const configName = 'Test';
      await service.deleteConfig(configName);
      expect(mockAppConfigService.deleteConfig).toHaveBeenCalledWith(configName);
    });
  });
});
