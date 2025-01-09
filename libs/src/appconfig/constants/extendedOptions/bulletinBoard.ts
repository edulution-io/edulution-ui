import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';

const BULLETIN_BOARD_EXTENDED_OPTIONS: AppConfigExtendedOption[] = [
  {
    name: ExtendedOptionKeys.BULLETIN_BOARD_CATEGORY_TABLE,
    description: 'appExtendedOptions.bulletinBoardUrl',
    title: 'appExtendedOptions.bulletinBoardUrlTitle',
    type: ExtendedOptionField.table,
    value: '',
    width: 'full',
  },
];

export default BULLETIN_BOARD_EXTENDED_OPTIONS;
