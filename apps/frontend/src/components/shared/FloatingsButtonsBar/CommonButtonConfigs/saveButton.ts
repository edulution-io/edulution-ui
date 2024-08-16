import { t } from 'i18next';
import { MdOutlineSave } from 'react-icons/md';

const SaveButton = (onClick: () => void, isVisible?: boolean) => ({
  icon: MdOutlineSave,
  text: t('common.save'),
  onClick,
  isVisible,
});

export default SaveButton;
