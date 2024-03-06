import * as React from 'react';
import { Button as SHButton } from '@/components/ui/button';
import { cva, type VariantProps } from 'class-variance-authority';

import cn from '@/lib/utils';

import styles from './button.module.scss';

const originButtonVariants = cva(['p-4 hover:opacity-90 rounded-[8px]'], {
  variants: {
    variant: {
      'btn-collaboration': 'bg-ciDarkBlue',
      'btn-organisation': 'bg-ciLightBlue',
      'btn-infrastructure': 'bg-ciLightGreen',
      'btn-security': 'bg-ciGreenToBlue',
      'btn-outline': 'border border-input shadow-sm hover:bg-accent hover:text-accent-foreground',
      'btn-hexagon': cn('inline-block relative px-7 bg-ciGreenToBlue', styles.button),
    },
    size: {
      lg: 'h-10 rounded-md px-8',
      sm: 'h-8 rounded-md px-3 text-xs',
    },
  },
});

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof originButtonVariants> & {
    asChild?: boolean;
  };

const defaultProps: Partial<ButtonProps> = {
  asChild: false,
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, ...props }, ref) => {
  Button.displayName = 'Button';

  return (
    <SHButton
      className={cn(originButtonVariants({ variant, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.defaultProps = defaultProps;

export { Button, originButtonVariants };
