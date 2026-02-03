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

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import cn from '@libs/common/utils/className';
import HexagonIcon from '@/assets/layout/Hexagon.svg?react';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-colors',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    'w-fit gap-2 p-4 hover:opacity-90 rounded-xl',
  ],
  {
    variants: {
      variant: {
        'btn-transparent':
          'backdrop-bg-white absolute bottom-0 left-1/2 -translate-x-1/2 transform bg-opacity-70 backdrop-blur hover:bg-ciDarkGrey hover:opacity-85',
        'btn-collaboration': 'bg-primary text-white',
        'btn-organisation': 'bg-primary text-white',
        'btn-infrastructure': 'bg-ciLightGreen text-white',
        'btn-security': 'bg-ciGreenToBlue text-white',
        'btn-outline': 'border-[1px] border-gray-300 shadow-sm hover:bg-muted-light',
        'btn-hexagon': 'bg-cover bg-center flex items-center justify-center hover:scale-105',
        'btn-attention': 'bg-ciRed text-white',
        'btn-small': 'hover:bg-grey-700 mr-1 rounded-lg bg-white px-4 h-9 shadow-md font-normal',
        'btn-table':
          'h-10 items-center rounded-lg bg-white dark:border-none dark:bg-accent border-[1px] border-gray-300',
        'btn-ghost':
          'bg-transparent rounded-lg border-none shadow-none ring-0 outline-none hover:bg-accent hover:opacity-100 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
      },
      size: {
        default: 'h-16 px-4 py-2',
        none: '',
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-3',
        lg: 'h-10 px-8',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    hexagonIconAltText?: string;
  };

const defaultProps: Partial<ButtonProps> = {
  asChild: false,
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, hexagonIconAltText, asChild = false, children, ...props }, ref) => {
    Button.displayName = 'Button';

    const Comp = asChild ? Slot : 'button';
    const hasOwnSize = variant === 'btn-ghost';
    const effectiveSize = size ?? (hasOwnSize ? 'none' : undefined);

    return (
      <Comp
        {...props}
        className={cn(buttonVariants({ variant, size: effectiveSize, className }))}
        ref={ref}
      >
        {variant === 'btn-hexagon' ? (
          <div className="relative flex items-center justify-center">
            <HexagonIcon
              className="absolute"
              aria-label={hexagonIconAltText}
            />
            {children}
          </div>
        ) : (
          children
        )}
      </Comp>
    );
  },
);

Button.defaultProps = defaultProps;

export { Button, buttonVariants };
