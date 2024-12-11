import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import cn from '@libs/common/utils/className';

const DropdownMenu = ({
  trigger,
  items,
}: {
  trigger: React.ReactNode;
  items: { label: string; onClick: () => void }[];
}) => (
  <DropdownMenuPrimitive.Root>
    <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        className={cn('z-10 min-w-[8rem] overflow-hidden rounded-xl border bg-white p-1 text-gray-800 shadow-md')}
      >
        {items.map(({ label, onClick }) => (
          <DropdownMenuPrimitive.Item
            key={`${label}`}
            onSelect={onClick}
            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
          >
            {label}
          </DropdownMenuPrimitive.Item>
        ))}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  </DropdownMenuPrimitive.Root>
);

export default DropdownMenu;
