'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import cn from '@/lib/utils';

const ProgressSH = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value = 0, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn('relative h-2 w-full overflow-hidden rounded-full bg-gray-200', className)} // Changed h-4 to h-2
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full bg-orange-500 transition-all"
      style={{ width: `${value}%` }}
    />
  </ProgressPrimitive.Root>
));
ProgressSH.displayName = ProgressPrimitive.Root.displayName;

export default ProgressSH;
