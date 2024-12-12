export type DropdownMenuItemType = {
  label: string;
  onClick?: () => void;
  isSeparator?: boolean;
  isCheckbox?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};
