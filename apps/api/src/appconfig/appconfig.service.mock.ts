import FileSharingAppExtensions from '@libs/appconfig/constants/file-sharing-app-extension';

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
        name: 'ONLY_OFFICE',
        extensions: [
          {
            name: FileSharingAppExtensions.ONLY_OFFICE_URL,
            value: 'https://example.com/api/',
            title: 'OnlyOffice URL',
            description: 'The URL for OnlyOffice',
            type: 'input',
          },
          {
            name: FileSharingAppExtensions.ONLY_OFFICE_JWT_SECRET,
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
