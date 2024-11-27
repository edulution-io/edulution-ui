import APP_CONFIG_SECTION_KEYS_ONLY_OFFICE from '@libs/appconfig/constants/appConfigSectionKeysOnlyOffice';

export type TAppConfigSectionOnlyOffice =
  (typeof APP_CONFIG_SECTION_KEYS_ONLY_OFFICE)[keyof typeof APP_CONFIG_SECTION_KEYS_ONLY_OFFICE];
