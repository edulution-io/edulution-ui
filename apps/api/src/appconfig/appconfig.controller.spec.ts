import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AppConfigDto, AppIntegrationType } from '@libs/appconfig/types';
import FileSharingAppExtensions from '@libs/appconfig/extensions/types/file-sharing-app-extension';
import appExtensionOnlyOffice from '@libs/appconfig/extensions/constants/appExtensionOnlyOffice';
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
          appType: AppIntegrationType.NATIVE,
          options: {
            url: 'https://example.com/api/',
            apiKey: 'secret-key',
          },
          extendedOptions: [
            {
              name: appExtensionOnlyOffice.name,
              extensions: [
                {
                  name: FileSharingAppExtensions.ONLY_OFFICE_URL,
                  value: 'https://example.com/api/',
                  type: 'text',
                  width: 'full',
                },
                {
                  name: FileSharingAppExtensions.ONLY_OFFICE_JWT_SECRET,
                  value: 'secret-key',
                  type: 'text',
                  width: 'full',
                },
              ],
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
          appType: AppIntegrationType.NATIVE,
          options: {
            url: 'https://example.com/api/',
            apiKey: 'secret-key',
          },
          extendedOptions: [
            {
              name: appExtensionOnlyOffice.name,
              extensions: [
                {
                  name: FileSharingAppExtensions.ONLY_OFFICE_URL,
                  value: 'https://example.com/api/',
                  type: 'text',
                  width: 'full',
                },
                {
                  name: FileSharingAppExtensions.ONLY_OFFICE_JWT_SECRET,
                  value: 'secret-key',
                  type: 'text',
                  width: 'full',
                },
              ],
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
