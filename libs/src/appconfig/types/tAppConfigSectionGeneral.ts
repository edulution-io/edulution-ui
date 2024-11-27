import APP_CONFIG_SECTION_KEYS_GENERAL from '@libs/appconfig/constants/appConfigSectionKeysGeneral';

export type TAppConfigSectionGeneral =
  (typeof APP_CONFIG_SECTION_KEYS_GENERAL)[keyof typeof APP_CONFIG_SECTION_KEYS_GENERAL];
