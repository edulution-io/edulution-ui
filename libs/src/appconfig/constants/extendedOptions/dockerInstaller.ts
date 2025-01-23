import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';

const DOCKER_CONTAINER_EXTENDED_OPTIONS: AppConfigExtendedOption[] = [
  {
    name: ExtendedOptionKeys.DOCKER_CONTAINER_TABLE,
    description: 'dockerApplication.description',
    title: 'dockerApplication.title',
    type: ExtendedOptionField.table,
    value: '',
    width: 'full',
  },
];

export default DOCKER_CONTAINER_EXTENDED_OPTIONS;
