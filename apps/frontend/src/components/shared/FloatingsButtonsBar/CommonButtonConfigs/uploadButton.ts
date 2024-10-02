import { t } from 'i18next';
import { FiUpload } from 'react-icons/fi';

const UploadButton = (onClick: () => void) => ({
  icon: FiUpload,
  text: t('tooltip.upload'),
  onClick,
});

export default UploadButton;
