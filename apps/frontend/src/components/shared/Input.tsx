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
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@edulution-io/ui-kit';
import { inputVariants } from '@libs/ui/constants/commonClassNames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants> & {
    shouldTrim?: boolean;
    icon?: React.ReactNode;
  };

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', variant, shouldTrim = false, onChange, icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const needsWrapper = isPassword || icon;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;

      if (onChange) {
        if (type === 'text' || isPassword) {
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

    const inputElement = (
      <input
        type={isPassword && showPassword ? 'text' : type}
        inputMode={type === 'number' ? 'numeric' : undefined}
        className={cn(inputVariants({ variant }), isPassword && 'pr-10', className)}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );

    if (!needsWrapper) {
      return inputElement;
    }

    return (
      <div className="relative w-full">
        {inputElement}
        {isPassword && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5">
            <button
              type="button"
              onClickCapture={() => setShowPassword((prevValue) => !prevValue)}
            >
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="h-5 w-5 text-ciGrey"
              />
            </button>
          </div>
        )}
        {icon && <div className="absolute inset-y-0 right-0 flex items-center pr-3">{icon}</div>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
