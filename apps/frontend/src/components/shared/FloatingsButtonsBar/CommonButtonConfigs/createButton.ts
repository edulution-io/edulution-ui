import { t } from 'i18next';
import { MdAdd } from 'react-icons/md';

const CreateButton = (onClick: () => void) => ({
  icon: MdAdd,
  text: t('common.create'),
  onClick,
});

export default CreateButton;
