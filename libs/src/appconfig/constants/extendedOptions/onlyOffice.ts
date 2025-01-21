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
    width: 'full',
  },
  {
    name: ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET,
    title: 'appExtendedOptions.onlyOfficeJwtSecretTitle',
    description: 'appExtendedOptions.onlyOfficeJwtSecretDescription',
    type: ExtendedOptionField.password,
    value: '',
    width: 'full',
  },
];

export default ONLY_OFFICE_EXTENDED_OPTIONS;
