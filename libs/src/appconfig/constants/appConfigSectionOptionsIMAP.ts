import APP_CONFIG_SECTION_KEYS_IMAP from '@libs/appconfig/constants/appConfigSectionKeysIMAP';
import { AppConfigSection } from '@libs/appconfig/types/appConfigSection';

const APP_CONFIG_SECTION_OPTIONS_IMAP: AppConfigSection = {
  sectionName: 'IMAP',
  options: [
    {
      name: APP_CONFIG_SECTION_KEYS_IMAP.MAIL_IMAP_URL,
      width: 'full',
      type: 'text',
      value: '',
    },
    {
      name: APP_CONFIG_SECTION_KEYS_IMAP.MAIL_IMAP_PORT,
      width: 'half',
      type: 'number',
      value: 993,
    },
    {
      name: APP_CONFIG_SECTION_KEYS_IMAP.MAIL_IMAP_SECURE,
      width: 'half',
      type: 'boolean',
      value: true,
    },
    {
      name: APP_CONFIG_SECTION_KEYS_IMAP.MAIL_IMAP_TLS_REJECT_UNAUTHORIZED,
      width: 'half',
      type: 'boolean',
      value: false,
    },
  ],
};

export default APP_CONFIG_SECTION_OPTIONS_IMAP;
