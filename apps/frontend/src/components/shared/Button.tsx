import * as React from 'react';
import { ButtonSH as SHButton } from '@/components/ui/ButtonSH';
import { cva, type VariantProps } from 'class-variance-authority';
import { HexagonIcon } from '@/assets/layout';
import cn from '@libs/common/utils/className';

const originButtonVariants = cva(['p-4 hover:opacity-90 rounded-xl text-background'], {
  variants: {
    variant: {
      'btn-collaboration': 'bg-ciDarkBlue',
      'btn-organisation': 'bg-ciLightBlue',
      'btn-infrastructure': 'bg-ciLightGreen',
      'btn-security': 'bg-ciGreenToBlue',
      'btn-outline': 'border border-input shadow-sm hover:bg-accent hover:text-accent-foreground',
      'btn-hexagon': 'bg-cover bg-center flex items-center justify-center',
      'btn-attention': 'bg-ciRed',
      'btn-small': 'hover:bg-grey-700 mr-1 rounded bg-white px-4 text-white h-8',
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
    hexagonIconAltText?: string;
  };

const defaultProps: Partial<ButtonProps> = {
  asChild: false,
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, hexagonIconAltText, children, ...props }, ref) => {
    Button.displayName = 'Button';

    return (
      <SHButton
        className={cn(originButtonVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        {variant === 'btn-hexagon' ? (
          <div className="relative flex items-center justify-center">
            <img
              className="absolute"
              src={HexagonIcon}
              alt={hexagonIconAltText}
            />
            <div className="">{children}</div>
          </div>
        ) : (
          children
        )}
      </SHButton>
    );
  },
);

Button.defaultProps = defaultProps;

export { Button, originButtonVariants };
