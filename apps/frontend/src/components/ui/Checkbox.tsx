/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
