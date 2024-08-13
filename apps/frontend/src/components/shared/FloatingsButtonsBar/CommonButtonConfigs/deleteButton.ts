import { t } from 'i18next';
import { MdOutlineDeleteOutline } from 'react-icons/md';

const DeleteButton = (onClick: () => void, isVisible?: boolean) => ({
  icon: MdOutlineDeleteOutline,
  text: t('common.delete'),
  onClick,
  isVisible,
});

export default DeleteButton;
