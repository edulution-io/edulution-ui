import MailAppExtensions from '@libs/appconfig/constants/mail-app-extension';
import AppConfigExtendedOptions from '@libs/appconfig/types/appConfigExtendedOptions';

const appExtensionIMAP: AppConfigExtendedOptions = {
  name: 'IMAP',
  extensions: [
    {
      name: MailAppExtensions.MAIL_IMAP_URL,
      width: 'full',
      type: 'text',
      value: '',
    },
    {
      name: MailAppExtensions.MAIL_IMAP_PORT,
      width: 'half',
      type: 'number',
      value: 993,
    },
    {
      name: MailAppExtensions.MAIL_IMAP_SECURE,
      width: 'half',
      type: 'switch',
      value: true,
    },
    {
      name: MailAppExtensions.MAIL_IMAP_TLS_REJECT_UNAUTHORIZED,
      width: 'half',
      type: 'switch',
      value: false,
    },
  ],
};

export default appExtensionIMAP;
