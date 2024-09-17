import MailAppExtensions from '@libs/appconfig/extensions/types/mail-app-extension';
import AppExtension from '@libs/appconfig/extensions/types/appExtension';

const appExtensionIMAP: AppExtension = {
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
