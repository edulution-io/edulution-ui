import { t } from 'i18next';
import { MdOutlineDriveFileMove } from 'react-icons/md';

const MoveButton = (onClick: () => void) => ({
  icon: MdOutlineDriveFileMove,
  text: t('tooltip.move'),
  onClick,
});

export default MoveButton;
