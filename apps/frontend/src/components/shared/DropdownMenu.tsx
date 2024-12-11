import React from 'react';
import cn from '@libs/common/utils/className';
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSH,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenuSH';

type DropdownMenuItemType = {
  label: string;
  onClick?: () => void;
  isSeparator?: boolean;
  isCheckbox?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

type DropdownMenuProps = {
  trigger: React.ReactNode;
  items: DropdownMenuItemType[];
};

const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, items }) => (
  <DropdownMenuSH>
    <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        className={cn(
          'z-50 min-w-[8rem] overflow-hidden rounded-lg border border-gray-700 bg-gray-800 p-1 text-white shadow-md',
        )}
      >
        {items.map((item) => {
          if (item.isSeparator) {
            return (
              <DropdownMenuSeparator
                key={`separator-${item.label}`}
                className="-mx-1 my-1 h-px bg-gray-600"
              />
            );
          }
          if (item.isCheckbox) {
            return (
              <DropdownMenuCheckboxItem
                key={`checkbox-${item.label}`}
                checked={item.checked}
                onCheckedChange={item.onCheckedChange}
              >
                {item.label}
              </DropdownMenuCheckboxItem>
            );
          }
          return (
            <DropdownMenuItem
              key={`item-${item.label}`}
              onSelect={item.onClick}
              className="cursor-pointer rounded-lg bg-gray-800 px-4 py-2 hover:bg-gray-600"
            >
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuSH>
);

export default DropdownMenu;
