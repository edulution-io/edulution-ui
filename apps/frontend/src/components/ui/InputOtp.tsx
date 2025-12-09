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
import { DashIcon } from '@radix-ui/react-icons';
import { OTPInput, OTPInputContext } from 'input-otp';
import { type VariantProps } from 'class-variance-authority';

import cn from '@libs/common/utils/className';
import { inputOTPSlotVariants, inputOTPCaretVariants } from '@libs/ui/constants/commonClassNames';

const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput
      ref={ref}
      containerClassName={cn('flex items-center gap-2 has-[:disabled]:opacity-50', containerClassName)}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  ),
);
InputOTP.displayName = 'InputOTP';

const InputOTPGroup = React.forwardRef<React.ElementRef<'div'>, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center', className)}
      {...props}
    />
  ),
);
InputOTPGroup.displayName = 'InputOTPGroup';

type InputOTPSlotProps = React.ComponentPropsWithoutRef<'div'> &
  VariantProps<typeof inputOTPSlotVariants> & {
    index: number;
    type?: 'default' | 'pin';
  };

const InputOTPSlot = React.forwardRef<React.ElementRef<'div'>, InputOTPSlotProps>(
  ({ index, className, variant = 'default', type = 'default', ...props }, ref) => {
    const inputOTPContext = React.useContext(OTPInputContext);
    const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

    return (
      <div
        ref={ref}
        className={cn(inputOTPSlotVariants({ variant }), isActive && 'z-10 ring-1 ring-ring', className)}
        {...props}
      >
        {type === 'pin' && char ? '•' : char}
        {hasFakeCaret && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className={cn(inputOTPCaretVariants({ variant }))} />
          </div>
        )}
      </div>
    );
  },
);
InputOTPSlot.displayName = 'InputOTPSlot';

const InputOTPSeparator = React.forwardRef<React.ElementRef<'div'>, React.ComponentPropsWithoutRef<'div'>>(
  ({ ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      {...props}
    >
      <DashIcon />
    </div>
  ),
);
InputOTPSeparator.displayName = 'InputOTPSeparator';

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
