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

'use client';

import React, { useCallback, useState } from 'react';
import { de, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { HiTrash } from 'react-icons/hi2';
import { CalendarIcon } from '@radix-ui/react-icons';
import { INPUT_DEFAULT, INPUT_VARIANT_DEFAULT, INPUT_VARIANT_DIALOG } from '@libs/ui/constants/commonClassNames';
import DropdownVariant from '@libs/ui/types/DropdownVariant';
import cn from '@libs/common/utils/className';
import safeGetHours from '@libs/common/utils/Date/safeGetHours';
import safeGetMinutes from '@libs/common/utils/Date/safeGetMinutes';
import safeGetDate from '@libs/common/utils/Date/safeGetDate';
import useLanguage from '@/hooks/useLanguage';
import { Button } from '@/components/shared/Button';
import { Calendar } from '@/components/ui/Calendar';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import MinuteButton from '@/components/ui/DateTimePicker/MinuteButton';
import HourButton from '@/components/ui/DateTimePicker/HourButton';

interface DateTimePickerFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  path: Path<T>;
  translationId?: string;
  variant?: DropdownVariant;
  allowPast?: boolean;
  isDateRequired?: boolean;
}

const DateTimePickerField = <T extends FieldValues>(props: DateTimePickerFieldProps<T>) => {
  const { form, path, translationId, variant = 'default', isDateRequired, allowPast } = props;

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { t } = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'de' ? de : enUS;

  const fieldValue = form.watch(path);
  const hours = safeGetHours(fieldValue);
  const minutes = safeGetMinutes(fieldValue);

  const handleClear = useCallback(() => {
    form.setValue(path, null as PathValue<T, Path<T>>, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [fieldValue, form, path]);

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) {
        form.setValue(path, date as PathValue<T, Path<T>>);
        return;
      }
      const newDate = safeGetDate(fieldValue);
      newDate.setDate(date.getDate());
      newDate.setMonth(date.getMonth());
      newDate.setFullYear(date.getFullYear());
      form.setValue(path, newDate as PathValue<T, Path<T>>, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [fieldValue, form, path],
  );

  const onChangeHour = useCallback(
    (hour: number) => {
      const newDate = safeGetDate(fieldValue);
      newDate.setHours(hour);
      form.setValue(path, newDate as PathValue<T, Path<T>>, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [fieldValue, form, path],
  );

  const onChangeMinute = useCallback(
    (minute: number) => {
      const newDate = safeGetDate(fieldValue);
      newDate.setMinutes(minute);
      form.setValue(path, newDate as PathValue<T, Path<T>>, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [fieldValue, form, path],
  );

  const isDateDisabled = useCallback((date: Date) => {
    const newDate = new Date();
    const yesterday = newDate.getTime() - 24 * 60 * 60 * 1000;
    newDate.setTime(yesterday);

    return date < newDate;
  }, []);

  const timeDisplay: string = fieldValue
    ? new Date(fieldValue).toLocaleString(language, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',

        hour: 'numeric',
        minute: 'numeric',
        hour12: language === 'en',
      })
    : t('form.input.dateTimePicker.placeholder');

  return (
    <Form {...form}>
      <FormFieldSH
        control={form.control}
        name={path}
        rules={{
          required: isDateRequired ? t('form.errors.dateRequired') : false,
          validate: (value: unknown) => {
            if (!value) return true;
            const date = value instanceof Date ? value : null;
            if (!date || Number.isNaN(date.getTime())) {
              return t('form.errors.dateInvalid');
            }
            if (!allowPast && date.getTime() < Date.now()) {
              return t('form.errors.datePast');
            }

            return true;
          },
        }}
        render={() => (
          <FormItem className="flex flex-col space-y-0">
            {translationId ? <p className="text-m font-bold text-background">{t(translationId)}</p> : null}
            <Popover
              open={isOpen}
              onOpenChange={setIsOpen}
            >
              <PopoverTrigger asChild>
                <FormControl
                  className={cn(
                    'w-auto p-0',
                    'rounded-md',
                    INPUT_DEFAULT,
                    variant === 'dialog' ? INPUT_VARIANT_DIALOG : INPUT_VARIANT_DEFAULT,
                    isOpen ? 'border-ring' : 'border-transparent',
                  )}
                >
                  <Button
                    variant="btn-outline"
                    className={cn(
                      'my-0 h-10 w-fit px-3 py-0 pl-3 text-left font-normal',
                      !fieldValue && 'text-muted-foreground',
                    )}
                  >
                    {timeDisplay}
                    <HiTrash
                      className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                      onClick={(event) => {
                        event.preventDefault();
                        handleClear();
                      }}
                      visibility={fieldValue ? 'visible' : 'hidden'}
                    />
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" />
                  </Button>
                </FormControl>
              </PopoverTrigger>

              <PopoverContent
                className={cn('w-auto p-0', {
                  'bg-background text-foreground': variant === 'default',
                  'border-ring bg-muted text-secondary': variant === 'dialog',
                })}
              >
                <div className="sm:flex">
                  <Calendar
                    mode="single"
                    selected={fieldValue && (fieldValue as unknown) instanceof Date ? fieldValue : undefined}
                    onSelect={handleDateSelect}
                    initialFocus
                    disabled={isDateDisabled}
                    locale={locale}
                  />
                  <div>
                    <div className="m-2 flex h-6 justify-center">
                      {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}{' '}
                      {t('form.input.dateTimePicker.timeSlot')}
                    </div>
                    <div className="flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
                      <ScrollArea className="w-64 sm:w-auto">
                        <div className="flex p-2 sm:flex-col">
                          {Array.from({ length: 24 }, (_, i) => i)
                            .reverse()
                            .map((hour) => (
                              <HourButton
                                key={hour}
                                hour={hour}
                                currentHour={hours}
                                onChangeHour={onChangeHour}
                                variant={variant}
                              />
                            ))}
                        </div>
                      </ScrollArea>

                      <ScrollArea className="w-64 sm:w-auto">
                        <div className="flex p-2 sm:flex-col">
                          {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                            <MinuteButton
                              key={minute}
                              minute={minute}
                              currentMinute={minutes}
                              onChangeMinute={onChangeMinute}
                              variant={variant}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
};

export default DateTimePickerField;
