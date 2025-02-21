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

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import cn from '@libs/common/utils/className';
import convertDateToDateTimeInput from './convertDateTimeInputToDate';

export const originInputVariants = cva(['rounded'], {
  variants: {
    variant: {
      login:
        'block w-full border-2 border-gray-300 bg-background px-3 py-2 shadow-md placeholder:text-p focus:border-gray-600 focus:bg-background focus:placeholder-muted focus:outline-none text-foreground',
      lightGrayDisabled: 'bg-ciDarkGreyDisabled text-secondary placeholder:text-p focus:outline-none',
      default: 'bg-accent text-secondary placeholder:text-p focus:outline-none',
      dialog: 'bg-muted text-foreground placeholder:text-p focus:outline-none text-background',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type ExcludedInputProps = 'value' | 'onChange';
type DateTimeInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, ExcludedInputProps> &
  VariantProps<typeof originInputVariants> & {
    value: Date | undefined;
    onChange?: (value: Date | undefined) => void;
    popupColorScheme?: string;
  };

const DateTimeInput = React.forwardRef<HTMLInputElement, DateTimeInputProps>(
  ({ className, variant, popupColorScheme = 'dark', onChange, ...props }, ref) => {
    const minimumDateString = convertDateToDateTimeInput(new Date());

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      onChange?.(value ? new Date(value) : undefined);
    };

    return (
      <div className="relative">
        <input
          {...props}
          aria-label="Date and time"
          type="datetime-local"
          value={props.value ? convertDateToDateTimeInput(props.value) : ''}
          onChange={handleChange}
          style={{
            colorScheme: popupColorScheme,
          }}
          className={cn(
            'placeholder:color:secondary flex h-9 w-[210px] rounded-md px-3 py-1 text-p text-background shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            originInputVariants({ variant }),
            className,
          )}
          min={minimumDateString}
          ref={ref}
        />
      </div>
    );
  },
);
DateTimeInput.displayName = 'DateTimeInput';

export { DateTimeInput };
