import { IconType } from 'react-icons';
import { DropdownOption } from '@libs/filesharing/types/fileCreationDropDownOptions';
import { AvailableFileTypesType } from '@libs/filesharing/types/availableFileTypesType';

interface FloatingButtonConfig {
  icon: IconType;
  text: string;
  onClick: () => void;
  isVisible?: boolean;
  variant?: 'button' | 'dropdown';
  options?: DropdownOption[];
  onSelectFileSelect?: (fileType: AvailableFileTypesType) => void;
}

export default FloatingButtonConfig;
