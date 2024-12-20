import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';

const MAIL_IMAP_EXTENDED_OPTIONS: AppConfigExtendedOption[] = [
  // TODO: ENABLE BOOLEAN TYPE WITH A SWITCH AS INPUT COMPONENT
  // TODO: ENABLE THE DEFINITION OF THE USED SPACE FOR THE INPUT ELEMENT
  {
    name: ExtendedOptionKeys.MAIL_IMAP_URL,
    description: 'appExtendedOptions.onlyOfficeUrl',
    title: 'appExtendedOptions.onlyOfficeUrlTitle',
    type: ExtendedOptionField.input,
    value: 'webmail.schulung.multi.schule',
  },
  {
    name: ExtendedOptionKeys.MAIL_IMAP_PORT,
    title: 'appExtendedOptions.onlyOfficeJwtSecretTitle',
    description: 'appExtendedOptions.onlyOfficeJwtSecretDescription',
    type: ExtendedOptionField.password,
    value: '993',
  },
  {
    name: ExtendedOptionKeys.MAIL_IMAP_SECURE,
    title: 'appExtendedOptions.onlyOfficeJwtSecretTitle',
    description: 'appExtendedOptions.onlyOfficeJwtSecretDescription',
    type: ExtendedOptionField.password,
    value: 'true',
  },
  {
    name: ExtendedOptionKeys.MAIL_IMAP_TLS_REJECT_UNAUTHORIZED,
    title: 'appExtendedOptions.onlyOfficeJwtSecretTitle',
    description: 'appExtendedOptions.onlyOfficeJwtSecretDescription',
    type: ExtendedOptionField.password,
    value: 'false',
  },
];

export default MAIL_IMAP_EXTENDED_OPTIONS;
