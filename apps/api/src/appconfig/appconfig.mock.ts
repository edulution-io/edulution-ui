import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import { AppConfigDto } from '@libs/appconfig/types';

export const mockAppConfigService = {
  insertConfig: jest.fn().mockResolvedValue(undefined),
  updateConfig: jest.fn().mockResolvedValue(undefined),
  getAppConfigs: jest.fn().mockResolvedValue([]),
  deleteConfig: jest.fn().mockResolvedValue(undefined),
  getFileAsBase64: jest.fn(),
  getAppConfigByName: jest.fn().mockResolvedValue({
    options: {
      url: 'https://example.com/api/',
      apiKey: 'secret-key',
    },
    extendedOptions: {
      [ExtendedOptionKeys.ONLY_OFFICE_URL]: 'https://example.com/api/',
      [ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET]: 'secret-key',
    },
  }),
};

export const mockLdapGroup = ['/role-globaladministrator'];

export const mockAppConfig: AppConfigDto = {
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
  extendedOptions: {
    [ExtendedOptionKeys.ONLY_OFFICE_URL]: 'https://example.com/2/',
    [ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET]: 'secret-key',
  },
};

export const mockAppConfigModel = {
  create: jest.fn(),
  bulkWrite: jest.fn(),
  find: jest.fn().mockReturnValue({
    lean: jest.fn(),
  }),
  findOne: jest.fn().mockReturnValue({
    lean: jest.fn(),
  }),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
};
