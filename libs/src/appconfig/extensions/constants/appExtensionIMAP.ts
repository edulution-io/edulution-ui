import MailAppExtensions from '@libs/appconfig/extensions/types/mail-app-extension-enum';

const appExtensionIMAP = [
  {
    name: MailAppExtensions.MAIL_IMAP_URL,
    title: 'appExtendedOptions.imapFeed.imapURLTitle',
    description: 'appExtendedOptions.imapFeed.imapURL',
    type: 'input',
    value: '',
  },
  {
    name: MailAppExtensions.MAIL_IMAP_PORT,
    title: 'appExtendedOptions.imapFeed.imapPortTitle',
    description: 'appExtendedOptions.imapFeed.imapPort',
    type: 'input',
    value: '',
  },
  {
    name: MailAppExtensions.MAIL_IMAP_SECURE,
    title: 'appExtendedOptions.imapFeed.imapSecureTitle',
    description: 'appExtendedOptions.imapFeed.imapSecure',
    type: 'input',
    value: '',
  },
  {
    name: MailAppExtensions.MAIL_IMAP_TLS_REJECT_UNAUTHORIZED,
    title: 'appExtendedOptions.imapFeed.imapTlsRejectUnauthorizedTitle',
    description: 'appExtendedOptions.imapFeed.imapTlsRejectUnauthorized',
    type: 'input',
    value: '',
  },
];

export default appExtensionIMAP;
