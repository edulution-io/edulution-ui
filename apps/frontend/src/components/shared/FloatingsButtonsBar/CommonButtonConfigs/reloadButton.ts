import { t } from 'i18next';
import { TfiReload } from 'react-icons/tfi';

const ReloadButton = (onClick: () => void) => ({
  icon: TfiReload,
  text: t('common.reload'),
  onClick,
});

export default ReloadButton;
