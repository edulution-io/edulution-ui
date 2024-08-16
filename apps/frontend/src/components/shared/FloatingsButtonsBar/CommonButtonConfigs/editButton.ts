import { t } from 'i18next';
import { FiEdit } from 'react-icons/fi';

const EditButton = (onClick: () => void, isVisible?: boolean) => ({
  icon: FiEdit,
  text: t('common.edit'),
  onClick,
  isVisible,
});

export default EditButton;
