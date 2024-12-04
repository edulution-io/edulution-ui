import { t } from 'i18next';
import { MdLogin } from 'react-icons/md';

const JoinButton = (onClick: () => void, isVisible?: boolean) => ({
  icon: MdLogin,
  text: t('common.join'),
  onClick,
  isVisible,
});

export default JoinButton;
