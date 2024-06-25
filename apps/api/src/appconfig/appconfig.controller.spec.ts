/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import AppConfigController from './appconfig.controller';
import AppConfigService from './appconfig.service';
import { AppIntegrationType } from './appconfig.types';
import mockAppConfigService from './appconfig.service.mock';
import { AppConfig } from './appconfig.schema';

const mockAppConfigModel = {
  insertMany: jest.fn(),
  bulkWrite: jest.fn(),
  find: jest.fn(),
  deleteOne: jest.fn(),
};

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
      const appConfigDto = [
        {
          name: 'TestConfig',
          icon: 'test-icon',
          appType: AppIntegrationType.NATIVE,
          options: {
            url: 'https://example.com/api/',
            apiKey: 'secret-key',
          },
        },
      ];
      controller.createConfig(appConfigDto);
      expect(service.insertConfig).toHaveBeenCalledWith(appConfigDto);
    });
  });

  describe('updateConfig', () => {
    it('should call updateConfig method of appConfigService with correct arguments', () => {
      const appConfigDto = [
        {
          name: 'TestConfig',
          icon: 'test-icon',
          appType: AppIntegrationType.NATIVE,
          options: {
            url: 'https://example.com/api/',
            apiKey: 'secret-key',
          },
        },
      ];
      controller.updateConfig(appConfigDto);
      expect(service.updateConfig).toHaveBeenCalledWith(appConfigDto);
    });
  });

  describe('getAppConfigs', () => {
    it('should call getAppConfigs method of appConfigService', async () => {
      await controller.getAppConfigs();
      expect(service.getAppConfigs).toHaveBeenCalled();
    });
  });

  describe('deleteConfig', () => {
    it('should call deleteConfig method of appConfigService with correct arguments', () => {
      const name = 'TestConfig';
      controller.deleteConfig(name);
      expect(service.deleteConfig).toHaveBeenCalledWith(name);
    });
  });
});
