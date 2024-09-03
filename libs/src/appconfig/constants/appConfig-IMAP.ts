export enum ExtendedOptions_Imap {
  MAIL_IMAP_URL = 'MAIL_IMAP_URL',
  MAIL_IMAP_PORT = 'MAIL_IMAP_PORT',
  MAIL_IMAP_SECURE = 'MAIL_IMAP_SECURE',
  MAIL_IMAP_TLS_REJECT_UNAUTHORIZED = 'MAIL_IMAP_TLS_REJECT_UNAUTHORIZED',
}

export const appExtendedOptions_ImapFeed = [
  {
    name: ExtendedOptions_Imap.MAIL_IMAP_URL,
    title: 'appExtendedOptions.imapFeed.imapURLTitle',
    description: 'appExtendedOptions.imapFeed.imapURL',
    type: 'input',
    value: '',
  },
  {
    name: ExtendedOptions_Imap.MAIL_IMAP_PORT,
    title: 'appExtendedOptions.imapFeed.imapPortTitle',
    description: 'appExtendedOptions.imapFeed.imapPort',
    type: 'input',
    value: '',
  },
  {
    name: ExtendedOptions_Imap.MAIL_IMAP_SECURE,
    title: 'appExtendedOptions.imapFeed.imapSecureTitle',
    description: 'appExtendedOptions.imapFeed.imapSecure',
    type: 'input',
    value: '',
  },
  {
    name: ExtendedOptions_Imap.MAIL_IMAP_TLS_REJECT_UNAUTHORIZED,
    title: 'appExtendedOptions.imapFeed.imapTlsRejectUnauthorizedTitle',
    description: 'appExtendedOptions.imapFeed.imapTlsRejectUnauthorized',
    type: 'input',
    value: '',
  },
];
