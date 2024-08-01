'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';

import cn from '@/lib/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    onCheckboxClick?: (event: React.MouseEvent) => void;
    label?: string;
  }
>(({ className, onCheckboxClick = () => {}, label, ...props }, ref) => (
  <div className="flex items-center space-x-2">
    <CheckboxPrimitive.Root
      ref={ref}
      id={label}
      className={cn(
        'peer flex h-4 w-4 shrink-0 flex-col rounded-sm border border-primary shadow data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      onClick={onCheckboxClick}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn('flex flex-col items-center justify-center text-current')}>
        <CheckIcon className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
    <label htmlFor={label}>
      {label && <span className="cursor-pointer select-none text-foreground">{label}</span>}
    </label>
  </div>
));
Checkbox.defaultProps = {
  onCheckboxClick: () => {},
};

Checkbox.displayName = 'Checkbox';

export default Checkbox;
