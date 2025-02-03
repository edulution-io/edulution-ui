import { IconType } from 'react-icons';
import { DropdownOption } from '@libs/filesharing/types/fileCreationDropDownOptions';
import { TAvailableFileTypes } from '@libs/filesharing/types/availableFileTypesType';

interface FloatingButtonConfig {
  icon: IconType;
  text: string;
  onClick: () => void;
  isVisible?: boolean;
  variant?: 'button' | 'dropdown';
  options?: DropdownOption[];
  onSelectFileSelect?: (fileType: TAvailableFileTypes) => void;
}

export default FloatingButtonConfig;
