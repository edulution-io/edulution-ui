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

import React from 'react';
import { IconType } from 'react-icons';
import { type VariantProps } from 'class-variance-authority';
import cn from '@libs/common/utils/className';
import { v4 as uuidv4 } from 'uuid';
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
                key={uuidv4()}
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
