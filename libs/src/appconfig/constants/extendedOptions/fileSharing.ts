import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';

const FILE_SHARING_EXTENDED_OPTIONS: AppConfigExtendedOption[] = [
  {
    name: ExtendedOptionKeys.OVERRIDE_FILE_SHARING_DOCUMENT_VENDOR_MS_WITH_OO,
    description: 'appExtendedOptions.overrideDocumentVendorMSWithOODescription',
    title: 'appExtendedOptions.overrideDocumentVendorMSWithOOTitle',
    type: ExtendedOptionField.switch,
    value: false,
    width: 'full',
  },
];

export default FILE_SHARING_EXTENDED_OPTIONS;
