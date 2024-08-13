import { t } from 'i18next';
import { MdOutlineSave } from 'react-icons/md';

const SaveButton = (onClick: () => void) => ({
  icon: MdOutlineSave,
  text: t('common.save'),
  onClick,
});

export default SaveButton;
