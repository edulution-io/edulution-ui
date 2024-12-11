import React from 'react';
import cn from '@libs/common/utils/className';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSH,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenuSH';

const DropdownMenu = ({
  trigger,
  items,
}: {
  trigger: React.ReactNode;
  items: { label: string; onClick?: () => void; isSeparator?: boolean }[];
}) => (
  <DropdownMenuSH>
    <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        className={cn(
          'z-10 min-w-[8rem] overflow-hidden rounded-lg border border-gray-700 bg-gray-800 p-1 text-white shadow-md',
        )}
      >
        {items.map((item) =>
          item.isSeparator ? (
            <DropdownMenuSeparator
              key={`separator-${item.label}`}
              className="-mx-1 my-1 h-px bg-gray-600"
            />
          ) : (
            <DropdownMenuItem
              key={`${item.label}`}
              onSelect={item.onClick}
              className="cursor-pointer rounded-lg bg-gray-800 px-4 py-2 hover:bg-gray-600"
            >
              {item.label}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuSH>
);

export default DropdownMenu;
