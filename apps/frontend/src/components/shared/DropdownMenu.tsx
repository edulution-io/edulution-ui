/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
  menuContentClassName?: string;
};

const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, items, menuContentClassName }) => {
  if (!items || !items.length) return null;

  return (
    <DropdownMenuSH>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          className={cn(
            'z-50 min-w-[8rem] overflow-hidden rounded-lg border border-gray-700 bg-gray-800 p-1 text-background shadow-md',
            menuContentClassName,
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
