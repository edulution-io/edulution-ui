import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';

const ONLY_OFFICE_EXTENDED_OPTIONS: AppConfigExtendedOption[] = [
  {
    name: ExtendedOptionKeys.ONLY_OFFICE_URL,
    description: 'appExtendedOptions.onlyOfficeUrl',
    title: 'appExtendedOptions.onlyOfficeUrlTitle',
    type: ExtendedOptionField.input,
    value: '',
  },
  {
    name: ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET,
    title: 'appExtendedOptions.onlyOfficeJwtSecretTitle',
    description: 'appExtendedOptions.onlyOfficeJwtSecretDescription',
    type: ExtendedOptionField.password,
    value: '',
  },
];

export default ONLY_OFFICE_EXTENDED_OPTIONS;
