import MailAppExtensions from '@libs/appconfig/constants/mail-app-extension';
import AppConfigExtendedOptions from '@libs/appconfig/types/appConfigExtendedOptions';

const appExtensionIMAP: AppConfigExtendedOptions = {
  name: 'IMAP',
  options: [
    {
      name: MailAppExtensions.MAIL_IMAP_URL,
      width: 'full',
      type: 'text',
      defaultValue: '',
      value: '',
    },
    {
      name: MailAppExtensions.MAIL_IMAP_PORT,
      width: 'half',
      type: 'number',
      defaultValue: 993,
      value: 993,
    },
    {
      name: MailAppExtensions.MAIL_IMAP_SECURE,
      width: 'half',
      type: 'boolean',
      defaultValue: true,
      value: true,
    },
    {
      name: MailAppExtensions.MAIL_IMAP_TLS_REJECT_UNAUTHORIZED,
      width: 'half',
      type: 'boolean',
      defaultValue: false,
      value: false,
    },
  ],
};

export default appExtensionIMAP;
