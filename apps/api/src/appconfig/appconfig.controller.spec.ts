import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AppConfigDto } from '@libs/appconfig/types';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import { AppExtendedOptions } from '@libs/appconfig/constants/appExtendedType';
import AppConfigController from './appconfig.controller';
import AppConfigService from './appconfig.service';
import { AppConfig } from './appconfig.schema';
import mockAppConfigService from './appconfig.service.mock';

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
      const appConfigDto: AppConfigDto[] = [
        {
          name: 'TestConfig',
          icon: 'test-icon',
          appType: APP_INTEGRATION_VARIANT.native,
          options: {
            url: 'https://example.com/api/',
            apiKey: 'secret-key',
          },
          extendedOptions: [
            {
              name: AppExtendedOptions.ONLY_OFFICE_URL,
              value: 'https://example.com/api/',
              title: 'OnlyOffice URL',
              description: 'The URL for OnlyOffice',
              type: 'input',
            },
            {
              name: AppExtendedOptions.ONLY_OFFICE_JWT_SECRET,
              value: 'secret-key',
              title: 'OnlyOffice Secret',
              description: 'The secret key for OnlyOffice',
              type: 'input',
            },
          ],
          accessGroups: [
            { id: '1', value: 'group1', name: 'group1', path: 'group1', label: 'group1' },
            { id: '2', value: 'group2', name: 'group2', path: 'group2', label: 'group2' },
          ],
        },
      ];
      controller.createConfig(appConfigDto);
      expect(service.insertConfig).toHaveBeenCalledWith(appConfigDto);
    });

    it('should call updateConfig method of appConfigService with correct arguments', () => {
      const appConfigDto: AppConfigDto[] = [
        {
          name: 'TestConfig',
          icon: 'test-icon',
          appType: APP_INTEGRATION_VARIANT.native,
          options: {
            url: 'https://example.com/api/',
            apiKey: 'secret-key',
          },
          extendedOptions: [
            {
              name: AppExtendedOptions.ONLY_OFFICE_URL,
              value: 'https://example.com/api/',
              title: 'OnlyOffice URL',
              description: 'The URL for OnlyOffice',
              type: 'input',
            },
            {
              name: AppExtendedOptions.ONLY_OFFICE_JWT_SECRET,
              value: 'secret-key',
              title: 'OnlyOffice Secret',
              description: 'The secret key for OnlyOffice',
              type: 'input',
            },
          ],
          accessGroups: [
            { id: '1', value: 'group1', name: 'group1', path: 'group1', label: 'group1' },
            { id: '2', value: 'group2', name: 'group2', path: 'group2', label: 'group2' },
          ],
        },
      ];
      controller.updateConfig(appConfigDto);
      expect(service.updateConfig).toHaveBeenCalledWith(appConfigDto);
    });
  });

  describe('getAppConfigs', () => {
    const ldapGroups = ['group1', 'group2'];
    it('should call getAppConfigs method of appConfigService', async () => {
      await controller.getAppConfigs(ldapGroups);
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

export default mockAppConfigService;
