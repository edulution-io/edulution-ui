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
import Input, { originInputVariants } from '@/components/shared/Input';

type ActionIcon = { icon: IconType; onClick: () => void; className?: string };

type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof originInputVariants> & { actionIcons?: ActionIcon[] };

const InputWithActionIcons = React.forwardRef<HTMLInputElement, InputProps>(
  ({ actionIcons, className, variant, disabled, readOnly, ...props }, ref) => (
    <div className="relative">
      <Input
        {...props}
        className={cn(originInputVariants({ variant, className }))}
        ref={ref}
        readOnly={readOnly}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5">
        {actionIcons?.map(({ icon: ButtonIcon, onClick, className: buttonsClassName }, index) => (
          <button
            // eslint-disable-next-line react/no-array-index-key
            key={`input-buttons-${index}`}
            type="button"
            onClickCapture={onClick}
            disabled={disabled}
          >
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <ButtonIcon
                className={cn({ 'text-muted': disabled }, 'h-4 max-h-5 w-4 max-w-5 cursor-pointer', buttonsClassName)}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  ),
);
InputWithActionIcons.displayName = 'Input';

export default InputWithActionIcons;
