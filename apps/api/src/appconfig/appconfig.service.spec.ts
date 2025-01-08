import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { readFileSync } from 'fs';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import { AppConfigDto } from '@libs/appconfig/types';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type PatchConfigDto from '@libs/common/types/patchConfigDto';
import CustomHttpException from '@libs/error/CustomHttpException';
import AppConfigErrorMessages from '@libs/appconfig/types/appConfigErrorMessages';
import { HttpStatus } from '@nestjs/common';
import AppConfigService from './appconfig.service';
import { AppConfig } from './appconfig.schema';
import { mockAppConfig, mockAppConfigModel, mockLdapGroup } from './appconfig.mock';

jest.mock('fs');

const mockConnection = {
  db: {
    listCollections: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    }),
    createCollection: jest.fn().mockResolvedValue({}),
  },
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
      ],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
  });

  describe('insertConfig', () => {
    it('should successfully insert configs', async () => {
      await service.insertConfig(mockAppConfig, mockLdapGroup);
      expect(mockAppConfigModel.create).toHaveBeenCalledWith(mockAppConfig);
    });
  });

  describe('updateConfig', () => {
    it('should successfully update configs', async () => {
      mockAppConfigModel.updateOne.mockResolvedValue({});
      jest.spyOn(service, 'getAppConfigs').mockResolvedValue([mockAppConfig]);

      const result = await service.updateConfig(mockAppConfig.name, mockAppConfig, mockLdapGroup);

      expect(mockAppConfigModel.updateOne).toHaveBeenCalledWith(
        { name: mockAppConfig.name },
        {
          $set: {
            icon: mockAppConfig.icon,
            appType: mockAppConfig.appType,
            options: mockAppConfig.options,
            accessGroups: mockAppConfig.accessGroups,
            extendedOptions: mockAppConfig.extendedOptions,
          },
        },
        { upsert: true },
      );
      expect(service.getAppConfigs).toHaveBeenCalledWith(mockLdapGroup);
      expect(result).toEqual([mockAppConfig]);
    });
  });

  describe('patchconfig', () => {
    it('should update the configuration and return updated configs', async () => {
      const name = 'testConfig';
      const patchConfigDto: PatchConfigDto = { field: 'testField', value: 'newValue' };

      mockAppConfigModel.updateOne.mockResolvedValue({});
      jest.spyOn(service, 'getAppConfigs').mockResolvedValue([mockAppConfig]);

      const result = await service.patchConfig(name, patchConfigDto, mockLdapGroup);

      expect(mockAppConfigModel.updateOne).toHaveBeenCalledWith(
        { name },
        { $set: { [patchConfigDto.field]: patchConfigDto.value } },
      );
      expect(service.getAppConfigs).toHaveBeenCalledWith(mockLdapGroup);
      expect(result).toEqual([mockAppConfig]);
    });

    it('should throw CustomHttpException if updateOne fails', async () => {
      const name = 'testConfig';
      const patchConfigDto: PatchConfigDto = { field: 'testField', value: 'newValue' };

      mockAppConfigModel.updateOne.mockRejectedValue(new Error('Database error'));

      await expect(service.patchConfig(name, patchConfigDto, mockLdapGroup)).rejects.toThrow(
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
    it('should return app configs', async () => {
      const appConfigs: AppConfigDto[] = [mockAppConfig];

      const expectedConfigs = appConfigs.map((config) => ({
        name: config.name,
        icon: config.icon,
        appType: config.appType,
        options: { url: config.options.url },
        accessGroups: [],
        extendedOptions: config.extendedOptions,
      }));

      const ldapGroups = ['group1', 'group2'];
      jest.spyOn(mockAppConfigModel, 'find').mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue(appConfigs),
      });

      mockAppConfigModel.find.mockResolvedValue(appConfigs);

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
        extendedOptions: {
          [ExtendedOptionKeys.ONLY_OFFICE_URL]: 'https://example.com/2/',
          [ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET]: 'secret-key',
        },
      };

      jest.spyOn(mockAppConfigModel, 'findOne').mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue(expectedConfig),
      });

      mockAppConfigModel.findOne.mockResolvedValue(expectedConfig);

      const config = await service.getAppConfigByName(appConfigName);

      expect(config).toEqual(expectedConfig);
      expect(mockAppConfigModel.findOne).toHaveBeenCalledWith({ name: appConfigName });
    });
  });

  describe('deleteConfig', () => {
    it('should delete a config', async () => {
      mockAppConfigModel.updateOne.mockResolvedValue({});
      const configName = 'Test';
      jest.spyOn(service, 'getAppConfigs').mockResolvedValue([mockAppConfig]);

      const result = await service.deleteConfig(configName, mockLdapGroup);

      expect(mockAppConfigModel.deleteOne).toHaveBeenCalledWith({ name: configName });
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
