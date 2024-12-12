import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';

const mockAppConfigService = {
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

export default mockAppConfigService;
