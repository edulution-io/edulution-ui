import { t } from 'i18next';
import { RiShareForward2Line } from 'react-icons/ri';

const ConnectButton = (onClick: () => void) => ({
  icon: RiShareForward2Line,
  text: t('desktopdeployment.connect'),
  onClick,
});

export default ConnectButton;
