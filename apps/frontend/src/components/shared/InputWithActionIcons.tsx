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

import React from 'react';
import { IconType } from 'react-icons';
import { type VariantProps } from 'class-variance-authority';
import cn from '@libs/common/utils/className';
import Input, { originInputVariants } from '@/components/shared/Input';

type ActionIcon = { icon: IconType; onClick: () => void; className?: string };

type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof originInputVariants> & { actionIcons?: ActionIcon[] };

const InputWithActionIcons = React.forwardRef<HTMLInputElement, InputProps>(
  ({ actionIcons = [], className, variant, disabled, readOnly, style, ...props }, ref) => {
    const iconCount = actionIcons.length;
    const paddingRight = iconCount > 0 ? iconCount * 24 + 8 : undefined;

    return (
      <div className={cn('relative w-full', className)}>
        <Input
          {...props}
          ref={ref}
          className={cn(originInputVariants({ variant }), 'overflow-hidden text-ellipsis whitespace-nowrap', {
            'cursor-pointer': props.onMouseDown,
          })}
          style={{ ...style, paddingRight }}
          readOnly={readOnly}
          disabled={disabled}
        />
        {iconCount > 0 && (
          <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-2">
            {actionIcons.map(({ icon: ButtonIcon, onClick, className: btnClass }) => (
              <button
                key={ButtonIcon.toString()}
                type="button"
                onClick={onClick}
                disabled={disabled}
                className="flex items-center justify-center hover:opacity-60"
              >
                <ButtonIcon className={cn('h-4 w-4 cursor-pointer', disabled && 'text-muted', btnClass)} />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);

InputWithActionIcons.displayName = 'InputWithActionIcons';

export default InputWithActionIcons;
