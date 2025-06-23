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
        'block w-full border-2 border-gray-300 bg-background px-3 py-2 shadow-md placeholder:text-p focus:border-gray-600 focus:bg-background focus:placeholder-muted focus:outline-none text-foreground',
      lightGrayDisabled: 'bg-ciDarkGreyDisabled text-secondary placeholder:text-p focus:outline-none',
      default: INPUT_VARIANT_DEFAULT,
      dialog: INPUT_VARIANT_DIALOG,
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof originInputVariants> & {
    shouldTrim?: boolean;
    icon?: React.ReactNode;
    useFullWidth?: boolean;
  };

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', variant, shouldTrim = false, onChange, icon, useFullWidth = false, ...props }, ref) => {
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
      <div className={cn('relative', { 'w-full': useFullWidth })}>
        <SHInput
          type={showPassword ? 'text' : type}
          inputMode={type === 'number' ? 'numeric' : undefined}
          className={cn(originInputVariants({ variant, className }), { 'w-full': useFullWidth })}
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
