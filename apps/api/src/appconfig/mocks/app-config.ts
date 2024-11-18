import { AppConfigDto } from '@libs/appconfig/types';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import APP_CONFIG_SECTION_OPTIONS_GENERAL from '@libs/appconfig/constants/appConfigSectionOptionsGeneral';
import APP_CONFIG_SECTION_KEYS_GENERAL from '@libs/appconfig/constants/appConfigSectionKeysGeneral';

const testingAppConfig: AppConfigDto[] = [
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
            value: 'test/path',
          },
          {
            name: APP_CONFIG_SECTION_KEYS_GENERAL.APIKEY,
            width: 'full',
            type: 'text',
            value: '123456789',
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

export default testingAppConfig;
