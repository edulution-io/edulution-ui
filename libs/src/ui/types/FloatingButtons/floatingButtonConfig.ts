import { IconType } from 'react-icons';
import { DropdownOption } from '@libs/filesharing/types/fileCreationDropDownOptions';
import AVAILABLE_FILE_TYPES from '@libs/filesharing/types/availableFileTypes';
import { FileTypeKey } from '@libs/filesharing/types/fileTypeKey';

interface FloatingButtonConfig {
  icon: IconType;
  text: string;
  onClick: () => void;
  isVisible?: boolean;
  variant?: 'button' | 'dropdown';
  options?: DropdownOption[];
  onSelectFileSelect?: (fileType: (typeof AVAILABLE_FILE_TYPES)[FileTypeKey]) => void;
}

export default FloatingButtonConfig;
