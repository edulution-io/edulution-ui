import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';

const CLASS_MANAGEMENT_EXTENDED_OPTIONS = [
  {
    name: ExtendedOptionKeys.VEYON_PROXYS,
    description: 'appExtendedOptions.veyonProxys',
    title: 'appExtendedOptions.veyonProxysTitle',
    type: ExtendedOptionField.table,
    value: '',
  },
];

export default CLASS_MANAGEMENT_EXTENDED_OPTIONS;
