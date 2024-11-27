import APP_CONFIG_SECTION_KEYS_ONLY_OFFICE from '@libs/appconfig/constants/appConfigSectionKeysOnlyOffice';
import APP_CONFIG_SECTION_OPTIONS_GENERAL from '@libs/appconfig/constants/appConfigSectionOptionsGeneral';
import APP_CONFIG_SECTION_KEYS_GENERAL from '@libs/appconfig/constants/appConfigSectionKeysGeneral';

const mockAppConfigService = {
  insertConfig: jest.fn().mockResolvedValue(undefined),
  updateConfig: jest.fn().mockResolvedValue(undefined),
  getAppConfigs: jest.fn().mockResolvedValue([]),
  deleteConfig: jest.fn().mockResolvedValue(undefined),
  getFileAsBase64: jest.fn(),
  getAppConfigByName: jest.fn().mockResolvedValue({
    options: [
      {
        sectionName: APP_CONFIG_SECTION_OPTIONS_GENERAL.sectionName,
        options: [
          {
            name: APP_CONFIG_SECTION_KEYS_GENERAL.URL,
            width: 'full',
            type: 'text',
            value: 'https://example.com/api/',
          },
          {
            name: APP_CONFIG_SECTION_KEYS_GENERAL.APIKEY,
            width: 'full',
            type: 'text',
            value: 'secret-key',
          },
        ],
      },
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
