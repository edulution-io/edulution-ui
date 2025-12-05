'use client';
import cn from '@libs/common/utils/className';
import { Controls as ControlsPrimitive } from '@xyflow/react';
import type { ComponentProps } from 'react';

export type ControlsProps = ComponentProps<typeof ControlsPrimitive>;

export const Controls = ({ className, ...props }: ControlsProps) => (
  <ControlsPrimitive
    className={cn(
      'shadow-none! gap-px overflow-hidden rounded-md border bg-card p-1',
      '[&>button]:border-none! [&>button]:bg-transparent! [&>button]:hover:bg-secondary! [&>button]:rounded-md',
      className,
    )}
    {...props}
  />
);
