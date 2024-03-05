import * as React from 'react';
import { Button as SHButton } from '@/components/ui/button';
import { cva, type VariantProps } from 'class-variance-authority';

import cn from '@/lib/utils';

const originButtonVariants = cva(['text-white p-4 hover:opacity-90 rounded-[8px]'], {
  variants: {
    variant: {
      'btn-primary': 'bg-ciDarkBlue',
      'btn-secondary': 'bg-ciLightBlue',
      'btn-info': 'bg-ciLightGreen',
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
