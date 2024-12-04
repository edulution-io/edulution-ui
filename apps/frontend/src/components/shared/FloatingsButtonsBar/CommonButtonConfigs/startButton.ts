import { t } from 'i18next';
import { MdOutlinePlayArrow } from 'react-icons/md';

const StartButton = (onClick: () => void, isVisible?: boolean) => ({
  icon: MdOutlinePlayArrow,
  text: t('common.start'),
  onClick,
  isVisible,
});

export default StartButton;
