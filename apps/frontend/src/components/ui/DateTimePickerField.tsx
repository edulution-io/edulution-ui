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

import React from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { CalendarIcon } from '@radix-ui/react-icons';
import { DropdownVariant } from '@libs/ui/types/DropdownVariant';
import cn from '@libs/common/utils/className';
import { Button } from '@/components/shared/Button';
import { Calendar } from '@/components/ui/Calendar';
import { ScrollArea, ScrollBar } from '@/components/ui/ScrollArea';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';

interface DateTimePickerFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  path: Path<T>;
  translationId?: string;
  variant?: DropdownVariant;
}

const DateTimePickerField = <T extends FieldValues>(props: DateTimePickerFieldProps<T>) => {
  const { form, path, translationId, variant = 'default' } = props;

  const { t } = useTranslation();

  function handleDateSelect(date: Date | undefined) {
    if (!date) {
      form.setValue(path, date as PathValue<T, Path<T>>);
      return;
    }

    const currentDate = form.getValues(path) || new Date();
    const newDate = new Date(currentDate);

    newDate.setDate(date.getDate());
    newDate.setMonth(date.getMonth());
    newDate.setFullYear(date.getFullYear());

    form.setValue(path, newDate as PathValue<T, Path<T>>);
  }

  function handleTimeChange(type: 'hour' | 'minute', value: string) {
    const currentDate = form.getValues(path) || new Date();
    const newDate = new Date(currentDate);

    if (type === 'hour') {
      const hour = parseInt(value, 10);
      newDate.setHours(hour);
    } else if (type === 'minute') {
      newDate.setMinutes(parseInt(value, 10));
    }

    form.setValue(path, newDate as PathValue<T, Path<T>>);
  }

  return (
    <Form {...form}>
      <FormFieldSH
        control={form.control}
        name={path}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            {translationId ? <p className="text-m font-bold text-background">{t(translationId)}</p> : null}
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="btn-outline"
                    className={cn(
                      'my-0 h-10 w-fit px-3 py-0 pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground',
                    )}
                  >
                    {field.value ? format(field.value, 'MM/dd/yyyy HH:mm') : <span>MM/DD/YYYY HH:mm</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className={cn('w-auto p-0', {
                  'bg-background text-foreground': variant === 'default',
                  'bg-muted text-secondary': variant === 'dialog',
                })}
              >
                <div className="sm:flex">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    // eslint-disable-next-line react/jsx-no-bind
                    onSelect={handleDateSelect}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                  <div>
                    <div className="m-2 flex h-6 justify-center">
                      {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        field.value?.getHours() || 'hh'
                      }
                      :
                      {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        field.value?.getMinutes() ? String(field.value.getMinutes()).padStart(2, '0') : 'mm'
                      }{' '}
                      {t('common.clock')}
                    </div>
                    <div className="flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
                      <ScrollArea className="w-64 sm:w-auto">
                        <div className="flex p-2 sm:flex-col">
                          {Array.from({ length: 24 }, (_, i) => i)
                            .reverse()
                            .map((hour) => (
                              <Button
                                key={hour}
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                                variant={field.value && field.value.getHours() === hour ? 'btn-outline' : 'btn-small'}
                                className={cn('aspect-square max-h-[25px] max-w-[64px] shrink-0 sm:w-full', {
                                  'bg-background text-foreground': variant === 'default',
                                  'bg-muted text-secondary': variant === 'dialog',
                                })}
                                onClick={() => handleTimeChange('hour', hour.toString())}
                              >
                                {hour}
                              </Button>
                            ))}
                        </div>
                      </ScrollArea>
                      <ScrollArea className="w-64 sm:w-auto">
                        <div className="flex p-2 sm:flex-col">
                          {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                            <Button
                              key={minute}
                              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                              variant={field.value && field.value.getMinutes() === minute ? 'btn-outline' : 'btn-small'}
                              className={cn('aspect-square max-h-[25px] max-w-[64px] shrink-0 sm:w-full', {
                                'bg-background text-foreground': variant === 'default',
                                'bg-muted text-secondary': variant === 'dialog',
                              })}
                              onClick={() => handleTimeChange('minute', minute.toString())}
                            >
                              {minute.toString().padStart(2, '0')}
                            </Button>
                          ))}
                        </div>
                        <ScrollBar
                          orientation="horizontal"
                          className="sm:hidden"
                        />
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
