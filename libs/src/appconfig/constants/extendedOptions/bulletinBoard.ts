import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';

const BULLETIN_BOARD_EXTENDED_OPTIONS = [
  {
    name: ExtendedOptionKeys.BULLETIN_BOARD_CATEGORY_TABLE,
    description: 'appExtendedOptions.bulletinBoardUrl',
    title: 'appExtendedOptions.bulletinBoardUrlTitle',
    type: ExtendedOptionField.table,
    value: '',
  },
];

export default BULLETIN_BOARD_EXTENDED_OPTIONS;
