import { IconType } from 'react-icons';

export type DropdownMenuItemType = {
  label: string;
  onClick?: () => void;
  isSeparator?: boolean;
  isCheckbox?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  icon?: IconType;
  iconColor?: string;
};
