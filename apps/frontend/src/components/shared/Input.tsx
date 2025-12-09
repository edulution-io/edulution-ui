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
import {
  INPUT_BASE,
  INPUT_VARIANT_DEFAULT,
  INPUT_VARIANT_DIALOG,
  INPUT_VARIANT_LIGHT_GRAY_DISABLED,
  INPUT_VARIANT_LOGIN,
} from '@libs/ui/constants/commonClassNames';
import { EyeDarkIcon, EyeDarkSlashIcon, EyeLightIcon, EyeLightSlashIcon } from '@/assets/icons';

export const inputVariants = cva(INPUT_BASE, {
  variants: {
    variant: {
      login: INPUT_VARIANT_LOGIN,
      lightGrayDisabled: INPUT_VARIANT_LIGHT_GRAY_DISABLED,
      default: INPUT_VARIANT_DEFAULT,
      dialog: INPUT_VARIANT_DIALOG,
    },
    width: {
      auto: 'w-auto',
      half: 'w-1/2',
      full: 'w-full',
      dialog: 'w-4/5',
    },
  },
  defaultVariants: {
    variant: 'default',
    width: 'full',
  },
});

type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants> & {
    shouldTrim?: boolean;
    icon?: React.ReactNode;
  };

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', variant, width, shouldTrim = false, onChange, icon, ...props }, ref) => {
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
      <div className="relative">
        <input
          type={showPassword ? 'text' : type}
          inputMode={type === 'number' ? 'numeric' : undefined}
          className={cn(inputVariants({ variant, width }), className)}
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
