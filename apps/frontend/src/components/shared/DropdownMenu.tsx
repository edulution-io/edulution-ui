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
import { DropdownMenuItemType } from '@libs/ui/types/dropdownMenuItemType';

type DropdownMenuProps = {
  trigger: React.ReactNode;
  items: DropdownMenuItemType[];
};

const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, items }) => {
  if (!items || !items.length) return null;

  return (
    <DropdownMenuSH>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          className={cn(
            'z-50 min-w-[8rem] overflow-hidden rounded-lg border border-gray-700 bg-gray-800 p-1 text-background shadow-md',
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
                className="flex cursor-pointer items-center space-x-2 rounded-lg bg-gray-800 px-4 py-2 hover:bg-gray-600"
              >
                {item.icon && (
                  <div className="flex items-center justify-center rounded-lg bg-background p-1">
                    <item.icon
                      style={{ color: item.iconColor || 'black' }}
                      className="h-5 w-5"
                    />
                  </div>
                )}
                <span>{item.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuSH>
  );
};

export default DropdownMenu;
