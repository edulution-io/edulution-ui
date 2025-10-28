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

import * as React from 'react';
import { ButtonSH as SHButton } from '@/components/ui/ButtonSH';
import { cva, type VariantProps } from 'class-variance-authority';
import { HexagonIcon } from '@/assets/layout';
import cn from '@libs/common/utils/className';

const originButtonVariants = cva(['p-4 hover:opacity-90 rounded-xl text-background justify-center'], {
  variants: {
    variant: {
      'btn-transparent':
        'backdrop-bg-white absolute bottom-0 left-1/2 -translate-x-1/2 transform bg-opacity-70 backdrop-blur hover:bg-ciDarkGrey hover:opacity-85',
      'btn-collaboration': 'bg-primary',
      'btn-organisation': 'bg-primary',
      'btn-infrastructure': 'bg-ciLightGreen',
      'btn-security': 'bg-ciGreenToBlue',
      'btn-outline':
        'border border-input shadow-sm hover:bg-muted-light hover:text-accent-foreground text-accent-foreground',
      'btn-hexagon': 'bg-cover bg-center flex items-center justify-center',
      'btn-attention': 'bg-ciRed',
      'btn-small': 'hover:bg-grey-700 mr-1 rounded bg-white px-4 text-background h-9 shadow-sm font-normal text-base',
    },
    size: {
      sm: 'h-8 rounded-md px-3 text-xs',
      md: 'h-9 px-3',
      lg: 'h-10 rounded-md px-8',
    },
  },
});

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
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
        {...props}
        className={cn(originButtonVariants({ variant, className }))}
        ref={ref}
      >
        {variant === 'btn-hexagon' ? (
          <div className="relative flex items-center justify-center">
            <HexagonIcon
              className="absolute"
              aria-label={hexagonIconAltText}
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
