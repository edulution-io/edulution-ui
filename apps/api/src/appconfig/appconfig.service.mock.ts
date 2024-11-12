import APP_CONFIG_SECTION_KEYS_ONLY_OFFICE from '@libs/appconfig/constants/appConfigSectionKeysOnlyOffice';

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
        name: 'ONLY_OFFICE',
        options: [
          {
            name: APP_CONFIG_SECTION_KEYS_ONLY_OFFICE.ONLY_OFFICE_URL,
            value: 'https://example.com/api/',
            title: 'OnlyOffice URL',
            description: 'The URL for OnlyOffice',
            type: 'input',
          },
          {
            name: APP_CONFIG_SECTION_KEYS_ONLY_OFFICE.ONLY_OFFICE_JWT_SECRET,
            value: 'secret-key',
            title: 'OnlyOffice Secret',
            description: 'The secret key for OnlyOffice',
            type: 'input',
          },
        ],
      },
    ],
  }),
};

export default mockAppConfigService;
