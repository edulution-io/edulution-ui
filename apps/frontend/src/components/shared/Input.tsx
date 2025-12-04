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

import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import cn from '@libs/common/utils/className';
import { INPUT_VARIANT_DEFAULT, INPUT_VARIANT_DIALOG } from '@libs/ui/constants/commonClassNames';
import { Input as SHInput } from '@/components/ui/Input';
import { EyeDarkIcon, EyeDarkSlashIcon, EyeLightIcon, EyeLightSlashIcon } from '@/assets/icons';

export const originInputVariants = cva(['rounded'], {
  variants: {
    variant: {
      login:
        'block w-full border-2 border-gray-300 bg-white px-3 py-2 shadow-md placeholder:text-p focus:border-gray-600 focus:bg-white focus:placeholder-muted focus:outline-none text-black',
      lightGrayDisabled: 'bg-ciDarkGreyDisabled text-secondary placeholder:text-p focus:outline-none',
      default: INPUT_VARIANT_DEFAULT,
      dialog: INPUT_VARIANT_DIALOG,
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const inputWidthVariants = cva([], {
  variants: {
    widthVariant: {
      auto: 'w-auto',
      half: 'w-[50%]',
      full: 'w-full',
      dialog: 'w-[80%]',
    },
  },
  defaultVariants: { widthVariant: 'auto' },
});

type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof originInputVariants> &
  VariantProps<typeof inputWidthVariants> & {
    shouldTrim?: boolean;
    icon?: React.ReactNode;
  };

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', variant, widthVariant = 'auto', shouldTrim = false, onChange, icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;

      if (onChange) {
        if (type === 'text' || type === 'password') {
          const newValue = shouldTrim ? value.trim() : value;
          onChange({
            ...event,
            target: {
              ...event.target,
              value: newValue,
            },
          });
        } else if (type === 'number') {
          const newValue = Number(value);
          onChange({
            ...event,
            target: {
              ...event.target,
              value: newValue as unknown as string,
            },
          });
        }
      }
    };

    const closedIcon = variant === 'login' ? EyeDarkIcon : EyeLightIcon;
    const openedIcon = variant === 'login' ? EyeDarkSlashIcon : EyeLightSlashIcon;

    return (
      <div className={cn('relative', inputWidthVariants({ widthVariant }))}>
        <SHInput
          type={showPassword ? 'text' : type}
          inputMode={type === 'number' ? 'numeric' : undefined}
          className={cn(originInputVariants({ variant }), className, 'w-full')}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        {type === 'password' ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5">
            <button
              type="button"
              onClickCapture={() => setShowPassword((prevValue) => !prevValue)}
            >
              <img
                src={showPassword ? closedIcon : openedIcon}
                alt="eye"
                width="25px"
              />
            </button>
          </div>
        ) : null}
        {icon && <div className="absolute inset-y-0 right-0 flex items-center pr-3">{icon}</div>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
