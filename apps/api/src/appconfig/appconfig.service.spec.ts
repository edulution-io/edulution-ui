import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import AppConfigService from './appconfig.service';
import { AppIntegrationType } from './appconfig.types';
import { AppConfig } from './appconfig.schema';

const mockAppConfigModel = {
  insertMany: jest.fn(),
  bulkWrite: jest.fn(),
  find: jest.fn(),
  deleteOne: jest.fn(),
};

type MockModel = Partial<Record<keyof Model<any>, jest.Mock>>;

describe('AppConfigService', () => {
  let service: AppConfigService;
  let model: MockModel;

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
    model = module.get<MockModel>(getModelToken(AppConfig.name));
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
          options: {},
        },
      ];
      model.insertMany?.mockResolvedValue(appConfigs);
      await service.insertConfig(appConfigs);
      expect(model.insertMany).toHaveBeenCalledWith(appConfigs);
    });
  });

  describe('updateConfig', () => {
    it('should successfully update configs', async () => {
      const appConfigs = [
        {
          name: 'Test',
          icon: 'icon-path',
          appType: AppIntegrationType.EMBEDDED,
          options: {},
        },
      ];
      model.bulkWrite?.mockResolvedValue({ modifiedCount: 1 });
      await service.updateConfig(appConfigs);
      expect(model.bulkWrite).toHaveBeenCalled();
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
      model.find?.mockReturnValue(expectedConfigs);
      const configs = await service.getAppConfigs();
      expect(configs).toEqual(expectedConfigs);
    });
  });

  describe('deleteConfig', () => {
    it('should delete a config', async () => {
      const configName = 'Test';
      model.deleteOne?.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });
      await service.deleteConfig(configName);
      expect(model.deleteOne).toHaveBeenCalledWith({ name: configName });
    });
  });
});
