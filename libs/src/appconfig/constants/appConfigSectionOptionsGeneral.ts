import AppConfigOptions from '@libs/appconfig/types/appConfigOptions';
import APP_CONFIG_SECTION_KEYS_GENERAL from '@libs/appconfig/constants/appConfigSectionKeysGeneral';
import APP_CONFIG_SECTIONS_NAME_GENERAL from '@libs/appconfig/constants/appConfigSectionsNameGeneral';

const APP_CONFIG_SECTION_OPTIONS_GENERAL: AppConfigOptions = {
  sectionName: APP_CONFIG_SECTIONS_NAME_GENERAL,
  options: [
    {
      name: APP_CONFIG_SECTION_KEYS_GENERAL.URL,
      width: 'full',
      type: 'text',
      value: '',
    },
    {
      name: APP_CONFIG_SECTION_KEYS_GENERAL.APIKEY,
      width: 'full',
      type: 'text',
      value: '',
    },
    {
      name: APP_CONFIG_SECTION_KEYS_GENERAL.PROXYCONFIG,
      width: 'half',
      type: 'proxyConfig',
      value: true,
    },
  ],
};

export default APP_CONFIG_SECTION_OPTIONS_GENERAL;
