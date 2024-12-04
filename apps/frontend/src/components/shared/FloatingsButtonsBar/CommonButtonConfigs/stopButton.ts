import { t } from 'i18next';
import { MdStop } from 'react-icons/md';

const StopButton = (onClick: () => void, isVisible?: boolean) => ({
  icon: MdStop,
  text: t('common.stop'),
  onClick,
  isVisible,
});

export default StopButton;
