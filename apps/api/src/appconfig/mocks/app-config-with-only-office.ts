import { AppConfigDto } from '@libs/appconfig/types';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import APP_CONFIG_SECTION_OPTIONS_GENERAL from '@libs/appconfig/constants/appConfigSectionOptionsGeneral';
import APP_CONFIG_SECTION_KEYS_GENERAL from '@libs/appconfig/constants/appConfigSectionKeysGeneral';
import APP_CONFIG_SECTION_OPTIONS_ONLY_OFFICE from '@libs/appconfig/constants/appConfigSectionOptionsOnlyOffice';
import APP_CONFIG_SECTION_KEYS_ONLY_OFFICE from '@libs/appconfig/constants/appConfigSectionKeysOnlyOffice';

const testingAppConfigWithOnlyOffice: AppConfigDto[] = [
  {
    name: 'TestConfig',
    icon: 'test-icon',
    appType: APP_INTEGRATION_VARIANT.NATIVE,
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
            name: APP_CONFIG_SECTION_KEYS_GENERAL.PROXYCONFIG,
            width: 'half',
            type: 'proxyConfig',
            value: '',
          },
        ],
      },
      {
        sectionName: APP_CONFIG_SECTION_OPTIONS_ONLY_OFFICE.sectionName,
        options: [
          {
            name: APP_CONFIG_SECTION_KEYS_ONLY_OFFICE.ONLY_OFFICE_URL,
            value: 'https://example.com/api/',
            type: 'text',
            width: 'full',
          },
          {
            name: APP_CONFIG_SECTION_KEYS_ONLY_OFFICE.ONLY_OFFICE_JWT_SECRET,
            value: 'secret-key',
            type: 'text',
            width: 'full',
          },
        ],
      },
    ],
    accessGroups: [
      { id: '1', value: 'group1', name: 'group1', path: 'group1', label: 'group1' },
      { id: '2', value: 'group2', name: 'group2', path: 'group2', label: 'group2' },
    ],
  },
];

export default testingAppConfigWithOnlyOffice;
