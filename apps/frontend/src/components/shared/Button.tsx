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
import { ButtonSH as SHButton } from '@/components/ui/ButtonSH';
import { cva, type VariantProps } from 'class-variance-authority';
import cn from '@libs/common/utils/className';
import HexagonIcon from '@/assets/layout/Hexagon.svg?react';

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
