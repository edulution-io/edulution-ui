import { AppConfigSection } from '@libs/appconfig/types/appConfigSection';
import APP_CONFIG_SECTION_OPTIONS_GENERAL from '@libs/appconfig/constants/appConfigSectionOptionsGeneral';
import APP_CONFIG_SECTION_KEYS_GENERAL from '@libs/appconfig/constants/appConfigSectionKeysGeneral';

const APP_CONFIG_SECTION_OPTIONS_GENERAL_WITH_API_KEY: AppConfigSection = {
  sectionName: APP_CONFIG_SECTION_OPTIONS_GENERAL.sectionName,
  options: [
    ...APP_CONFIG_SECTION_OPTIONS_GENERAL.options,
    {
      name: APP_CONFIG_SECTION_KEYS_GENERAL.APIKEY,
      width: 'full',
      type: 'text',
      value: '',
    },
  ],
};

export default APP_CONFIG_SECTION_OPTIONS_GENERAL_WITH_API_KEY;
