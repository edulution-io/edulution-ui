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
import { t } from 'i18next';
import { cva, type VariantProps } from 'class-variance-authority';
import cn from '@libs/common/utils/className';
import convertDateToDateTimeInput from './convertDateToDateTimeInput';
import { INPUT_DEFAULT, INPUT_VARIANT_DEFAULT, INPUT_VARIANT_DIALOG } from '@libs/ui/constants/commonClassNames';

export const originInputVariants = cva(['rounded'], {
  variants: {
    variant: {
      default: INPUT_VARIANT_DEFAULT,
      dialog: INPUT_VARIANT_DIALOG,
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
          aria-label={t('form.input.dateTimePicker')}
          type="datetime-local"
          value={props.value ? convertDateToDateTimeInput(props.value) : ''}
          onChange={handleChange}
          style={{
            colorScheme: popupColorScheme,
          }}
          className={cn(INPUT_DEFAULT, originInputVariants({ variant }), 'w-[210px]', className)}
          min={minimumDateString}
          ref={ref}
        />
      </div>
    );
  },
);
DateTimeInput.displayName = 'DateTimeInput';

export { DateTimeInput };
