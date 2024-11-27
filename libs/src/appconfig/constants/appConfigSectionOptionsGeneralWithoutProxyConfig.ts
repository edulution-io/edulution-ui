import { AppConfigSection } from '@libs/appconfig/types/appConfigSection';
import APP_CONFIG_SECTIONS_NAME_GENERAL from '@libs/appconfig/constants/sectionsNameAppConfigGeneral';
import APP_CONFIG_SECTION_KEYS_GENERAL from '@libs/appconfig/constants/appConfigSectionKeysGeneral';

const APP_CONFIG_SECTION_OPTIONS_GENERAL_WITHOUT_PROXY_CONFIG: AppConfigSection = {
  sectionName: APP_CONFIG_SECTIONS_NAME_GENERAL,
  options: [
    {
      name: APP_CONFIG_SECTION_KEYS_GENERAL.URL,
      width: 'full',
      type: 'text',
      value: '',
    },
  ],
};

export default APP_CONFIG_SECTION_OPTIONS_GENERAL_WITHOUT_PROXY_CONFIG;
