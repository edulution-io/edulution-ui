import { ExtendedOptions_OnlyOffice } from '@libs/appconfig/constants/appConfig-OnlyOffice';

const mockAppConfigService = {
  insertConfig: jest.fn().mockResolvedValue(undefined),
  updateConfig: jest.fn().mockResolvedValue(undefined),
  getAppConfigs: jest.fn().mockResolvedValue([]),
  deleteConfig: jest.fn().mockResolvedValue(undefined),
  getAppConfigByName: jest.fn().mockResolvedValue({
    options: {
      url: 'https://example.com/api/',
      apiKey: 'secret-key',
    },
    extendedOptions: [
      {
        name: ExtendedOptions_OnlyOffice.ONLY_OFFICE_URL,
        value: 'https://example.com/api/',
        title: 'OnlyOffice URL',
        description: 'The URL for OnlyOffice',
        type: 'input',
      },
      {
        name: ExtendedOptions_OnlyOffice.ONLY_OFFICE_JWT_SECRET,
        value: 'secret-key',
        title: 'OnlyOffice Secret',
        description: 'The secret key for OnlyOffice',
        type: 'input',
      },
    ],
  }),
};

export default mockAppConfigService;
