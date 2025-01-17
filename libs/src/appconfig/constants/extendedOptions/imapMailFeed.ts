import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';

const MAIL_IMAP_EXTENDED_OPTIONS: AppConfigExtendedOption[] = [
  // TODO: ENABLE BOOLEAN TYPE WITH A SWITCH AS INPUT COMPONENT (ADDITIONALLY WIDTH OF THE COMPONENT) (https://github.com/edulution-io/edulution-ui/issues/342)
  {
    name: ExtendedOptionKeys.MAIL_IMAP_URL,
    title: 'appExtendedOptions.mailImapUrlTitle',
    description: 'appExtendedOptions.mailImapUrlDescription',
    type: ExtendedOptionField.input,
    value: 'webmail.schulung.multi.schule',
  },
  {
    name: ExtendedOptionKeys.MAIL_IMAP_PORT,
    title: 'appExtendedOptions.mailImapPortTitle',
    description: 'appExtendedOptions.mailImapPortDescription',
    type: ExtendedOptionField.input,
    value: '993',
  },
  {
    name: ExtendedOptionKeys.MAIL_IMAP_SECURE,
    title: 'appExtendedOptions.mailImapSecureTitle',
    description: 'appExtendedOptions.mailImapSecureDescription',
    type: ExtendedOptionField.input,
    value: 'true',
  },
  {
    name: ExtendedOptionKeys.MAIL_IMAP_TLS_REJECT_UNAUTHORIZED,
    title: 'appExtendedOptions.mailImapRejectUnauthorizedTitle',
    description: 'appExtendedOptions.mailImapRejectUnauthorizedDescription',
    type: ExtendedOptionField.input,
    value: 'false',
  },
];

export default MAIL_IMAP_EXTENDED_OPTIONS;
