import { AppConfigSection } from '@libs/appconfig/types/appConfigSection';
import APP_CONFIG_SECTION_OPTIONS_GENERAL_WITHOUT_PROXY_CONFIG from '@libs/appconfig/constants/appConfigSectionOptionsGeneralWithoutProxyConfig';
import TYPE_NAME_APP_CONFIG_FIELDS_PROXY_CONFIG from '@libs/appconfig/constants/typeNameAppConfigFieldsProxyConfig';
import APP_CONFIG_SECTION_KEYS_GENERAL from '@libs/appconfig/constants/appConfigSectionKeysGeneral';

const APP_CONFIG_SECTION_OPTIONS_GENERAL: AppConfigSection = {
  sectionName: APP_CONFIG_SECTION_OPTIONS_GENERAL_WITHOUT_PROXY_CONFIG.sectionName,
  options: [
    ...APP_CONFIG_SECTION_OPTIONS_GENERAL_WITHOUT_PROXY_CONFIG.options,
    {
      name: APP_CONFIG_SECTION_KEYS_GENERAL.PROXYCONFIG,
      width: 'half',
      type: TYPE_NAME_APP_CONFIG_FIELDS_PROXY_CONFIG,
      value: true,
    },
  ],
};

export default APP_CONFIG_SECTION_OPTIONS_GENERAL;
