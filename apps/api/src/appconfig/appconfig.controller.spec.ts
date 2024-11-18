import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import AppConfigController from './appconfig.controller';
import AppConfigService from './appconfig.service';
import { AppConfig } from './appconfig.schema';
import mockAppConfigService from './mocks/appconfig.service.mock';
import testingAppConfigWithOnlyOffice from './mocks/app-config-with-only-office';

jest.mock('./appconfig.service');

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
      controller.createConfig(testingAppConfigWithOnlyOffice);
      expect(service.insertConfig).toHaveBeenCalledWith(testingAppConfigWithOnlyOffice);
    });

    it('should call updateConfig method of appConfigService with correct arguments', () => {
      controller.updateConfig(testingAppConfigWithOnlyOffice);
      expect(service.updateConfig).toHaveBeenCalledWith(testingAppConfigWithOnlyOffice);
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
