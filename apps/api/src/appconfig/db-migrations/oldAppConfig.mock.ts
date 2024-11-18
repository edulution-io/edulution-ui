import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import APP_CONFIG_SECTION_KEYS_ONLY_OFFICE from '@libs/appconfig/constants/appConfigSectionKeysOnlyOffice';

const OLD_APP_CONFIG = {
  name: 'TestConfig',
  icon: 'test-icon',
  appType: APP_INTEGRATION_VARIANT.NATIVE,
  accessGroups: [
    { id: '1', value: 'group1', name: 'group1', path: 'group1', label: 'group1' },
    { id: '2', value: 'group2', name: 'group2', path: 'group2', label: 'group2' },
  ],
  options: {
    url: 'https://example.com/api/',
    apiKey: 'secret-key',
  },
  extendedOptions: [
    {
      name: APP_CONFIG_SECTION_KEYS_ONLY_OFFICE.ONLY_OFFICE_URL,
      value: 'test/path',
      title: 'OnlyOffice URL',
      description: 'The URL for OnlyOffice',
      type: 'input',
    },
    {
      name: APP_CONFIG_SECTION_KEYS_ONLY_OFFICE.ONLY_OFFICE_JWT_SECRET,
      value: '123456789',
      title: 'OnlyOffice Secret',
      description: 'The secret key for OnlyOffice',
      type: 'input',
    },
  ],
};

export default OLD_APP_CONFIG;
