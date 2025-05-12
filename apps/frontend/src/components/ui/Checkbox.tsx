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

'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';

import cn from '@libs/common/utils/className';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    onCheckboxClick?: (event: React.MouseEvent) => void;
    label?: string;
  }
>(({ className, onCheckboxClick = () => {}, label, disabled, ...props }, ref) => (
  <div className="flex items-center space-x-2">
    <CheckboxPrimitive.Root
      ref={ref}
      id={label}
      className={cn(
        'peer flex h-4 w-4 shrink-0 flex-col rounded-sm border border-primary shadow data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      onClick={(event) => {
        event.stopPropagation();
        onCheckboxClick(event);
      }}
      disabled={disabled}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn('flex flex-col items-center justify-center text-current')}>
        <CheckIcon className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
    <label htmlFor={label}>
      {label && (
        <span
          className={cn('select-none', {
            'cursor-pointer text-background': !disabled,
            'cursor-disabled text-muted-foreground': disabled,
          })}
        >
          {label}
        </span>
      )}
    </label>
  </div>
));
Checkbox.defaultProps = {
  onCheckboxClick: () => {},
};

Checkbox.displayName = 'Checkbox';

export default Checkbox;
