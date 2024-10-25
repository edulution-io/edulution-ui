import { AppExtendedOptions } from '@libs/appconfig/constants/appExtendedType';

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
  }),
};

export default mockAppConfigService;
