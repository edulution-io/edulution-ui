import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';

const MAIL_IMAP_EXTENDED_OPTIONS: AppConfigExtendedOption[] = [
  {
    name: ExtendedOptionKeys.MAIL_IMAP_URL,
    title: 'appExtendedOptions.mailImapUrlTitle',
    description: 'appExtendedOptions.mailImapUrlDescription',
    type: ExtendedOptionField.input,
    value: 'webmail.schulung.multi.schule',
    width: 'full',
  },
  {
    name: ExtendedOptionKeys.MAIL_IMAP_PORT,
    title: 'appExtendedOptions.mailImapPortTitle',
    description: 'appExtendedOptions.mailImapPortDescription',
    type: ExtendedOptionField.number,
    value: 993,
    width: 'third',
  },
  {
    name: ExtendedOptionKeys.MAIL_IMAP_SECURE,
    title: 'appExtendedOptions.mailImapSecureTitle',
    description: 'appExtendedOptions.mailImapSecureDescription',
    type: ExtendedOptionField.switch,
    value: true,
    width: 'third',
  },
  {
    name: ExtendedOptionKeys.MAIL_IMAP_TLS_REJECT_UNAUTHORIZED,
    title: 'appExtendedOptions.mailImapRejectUnauthorizedTitle',
    description: 'appExtendedOptions.mailImapRejectUnauthorizedDescription',
    type: ExtendedOptionField.switch,
    value: false,
    width: 'third',
  },
];

export default MAIL_IMAP_EXTENDED_OPTIONS;
