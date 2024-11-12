import APP_CONFIG_SECTION_KEYS_ONLY_OFFICE from '@libs/appconfig/constants/appConfigSectionKeysOnlyOffice';
import AppConfigOptions from '@libs/appconfig/types/appConfigOptions';

const APP_CONFIG_SECTION_OPTIONS_ONLY_OFFICE: AppConfigOptions = {
  sectionName: 'ONLY_OFFICE',
  options: [
    {
      name: APP_CONFIG_SECTION_KEYS_ONLY_OFFICE.ONLY_OFFICE_URL,
      width: 'full',
      type: 'text',
      value: '',
    },
    {
      name: APP_CONFIG_SECTION_KEYS_ONLY_OFFICE.ONLY_OFFICE_JWT_SECRET,
      width: 'full',
      type: 'text',
      value: '',
    },
  ],
};

export default APP_CONFIG_SECTION_OPTIONS_ONLY_OFFICE;
