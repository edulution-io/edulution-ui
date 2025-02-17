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
import DatePicker from '@/components/shared/DatePicker';
import TimeInput from '@/components/shared/TimeInput';
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { FaTrash } from 'react-icons/fa6';
import { FormMessage } from '@/components/ui/Form';

interface DateAndTimeInputProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  translationId: string;
}

const DateAndTimeInput = <T extends FieldValues>({ form, name, translationId }: DateAndTimeInputProps<T>) => {
  const { t } = useTranslation();
  const { setValue, watch, formState } = form;

  const handleIsVisibleStartDateChange = (value: Date | undefined) => {
    setValue(name, value ? (value.toISOString() as T[typeof name]) : (null as T[typeof name]), {
      shouldValidate: true,
    });
  };

  const handleResetButton = () => {
    setValue(name, null as T[typeof name], { shouldValidate: true });
  };

  const selectedDate = watch(name) as Date;
  const errorMessage = formState.errors[name]?.message?.toString();

  return (
    <>
      <div className="flex items-center text-background">
        {t(translationId)}
        <div className="ml-2">
          <DatePicker
            selected={selectedDate || undefined}
            onSelect={handleIsVisibleStartDateChange}
          />
        </div>
        {selectedDate && (
          <>
            <div className="ml-2 flex items-center">
              <TimeInput
                form={form}
                fieldName={name}
                date={selectedDate}
              />
            </div>
            <Button
              variant="btn-attention"
              size="md"
              className="ml-4 rounded-md text-background"
              onClick={handleResetButton}
            >
              <FaTrash />
            </Button>
          </>
        )}
      </div>
      <div>{formState.errors[name] && <FormMessage className="text-p">{errorMessage}</FormMessage>}</div>
    </>
  );
};

export default DateAndTimeInput;
