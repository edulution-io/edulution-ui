import { t } from 'i18next';
import { MdDownload } from 'react-icons/md';

const DownloadButton = (onClick: () => void, isVisible?: boolean) => ({
  icon: MdDownload,
  text: t('tooltip.download'),
  onClick,
  isVisible,
});

export default DownloadButton;
