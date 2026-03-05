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

'use client';

import React, { useCallback, useRef, useState } from 'react';
import { de, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { DeleteIcon } from '@libs/common/constants/standardActionIcons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faClock } from '@fortawesome/free-solid-svg-icons';
import { inputVariants } from '@libs/ui/constants/commonClassNames';
import DropdownVariant from '@libs/ui/types/DropdownVariant';
import DateTimePickerMode from '@libs/ui/types/dateTimePickerMode';
import DATE_TIME_PICKER_MODE from '@libs/ui/constants/dateTimePickerMode';
import { cn, Button } from '@edulution-io/ui-kit';
import safeGetHours from '@libs/common/utils/Date/safeGetHours';
import safeGetMinutes from '@libs/common/utils/Date/safeGetMinutes';
import safeGetDate from '@libs/common/utils/Date/safeGetDate';
import useLanguage from '@/hooks/useLanguage';
import { Calendar } from '@/components/ui/Calendar';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import TimeValueButton from '@/components/ui/DateTimePicker/TimeValueButton';

interface DateTimePickerFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  path: Path<T>;
  translationId?: string;
  variant?: DropdownVariant;
  mode?: DateTimePickerMode;
  allowPast?: boolean;
  isDateRequired?: boolean;
  placeholder?: string;
}

const DateTimePickerField = <T extends FieldValues>(props: DateTimePickerFieldProps<T>) => {
  const {
    form,
    path,
    translationId,
    variant = 'default',
    mode = DATE_TIME_PICKER_MODE.DATE_TIME,
    isDateRequired,
    allowPast,
    placeholder,
  } = props;

  const showDate = mode !== DATE_TIME_PICKER_MODE.TIME;
  const showTime = mode !== DATE_TIME_PICKER_MODE.DATE;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEditingTime, setIsEditingTime] = useState<boolean>(false);
  const timeInputRef = useRef<HTMLInputElement>(null);

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

  const handleTimeInputConfirm = useCallback(
    (value: string) => {
      const [newHours, newMinutes] = value.split(':').map(Number);
      if (Number.isNaN(newHours) || Number.isNaN(newMinutes)) return;
      const newDate = safeGetDate(fieldValue);
      newDate.setHours(newHours);
      newDate.setMinutes(newMinutes);
      form.setValue(path, newDate as PathValue<T, Path<T>>, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setIsEditingTime(false);
    },
    [fieldValue, form, path],
  );

  const handleTimeDoubleClick = useCallback(() => {
    setIsEditingTime(true);
    setTimeout(() => timeInputRef.current?.focus(), 0);
  }, []);

  const handleWheel = useCallback((wheelEvent: React.WheelEvent<HTMLDivElement>) => {
    const { currentTarget } = wheelEvent;
    currentTarget.scrollTop += wheelEvent.deltaY;
    wheelEvent.stopPropagation();
  }, []);

  const isDateDisabled = useCallback((date: Date) => {
    const newDate = new Date();
    const yesterday = newDate.getTime() - 24 * 60 * 60 * 1000;
    newDate.setTime(yesterday);

    return date < newDate;
  }, []);

  const getDisplayFormat = (): Intl.DateTimeFormatOptions => {
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: language === 'en' };

    if (mode === DATE_TIME_PICKER_MODE.DATE) return dateOptions;
    if (mode === DATE_TIME_PICKER_MODE.TIME) return timeOptions;
    return { ...dateOptions, ...timeOptions };
  };

  const timeDisplay: string = fieldValue
    ? new Date(fieldValue).toLocaleString(language, getDisplayFormat())
    : placeholder || t('form.input.dateTimePicker.placeholder');

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
            {translationId ? <p className="text-m font-bold">{t(translationId)}</p> : null}
            <Popover
              open={isOpen}
              onOpenChange={setIsOpen}
            >
              <PopoverTrigger asChild>
                <FormControl
                  className={cn('w-auto p-0', inputVariants({ variant: variant === 'dialog' ? 'dialog' : 'default' }))}
                >
                  <Button
                    variant="btn-outline"
                    className={cn(
                      'my-0 h-10 w-fit rounded-lg px-3 py-0 pl-3 text-left font-normal',
                      !fieldValue && 'text-muted-foreground',
                    )}
                  >
                    {timeDisplay}
                    <FontAwesomeIcon
                      icon={DeleteIcon}
                      className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                      onClick={(event) => {
                        event.preventDefault();
                        handleClear();
                      }}
                      visibility={fieldValue ? 'visible' : 'hidden'}
                    />
                    <FontAwesomeIcon
                      icon={showDate ? faCalendarDays : faClock}
                      className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                    />
                  </Button>
                </FormControl>
              </PopoverTrigger>

              <PopoverContent
                className={cn('w-auto rounded-xl p-0', {
                  'bg-background text-foreground': variant === 'default',
                  'border-ring bg-white text-background dark:bg-accent dark:text-secondary': variant === 'dialog',
                })}
              >
                <div className="sm:flex">
                  {showDate && (
                    <Calendar
                      mode="single"
                      selected={fieldValue && (fieldValue as unknown) instanceof Date ? fieldValue : undefined}
                      onSelect={handleDateSelect}
                      initialFocus
                      disabled={isDateDisabled}
                      locale={locale}
                    />
                  )}
                  {showTime && (
                    <div>
                      <div
                        className="m-2 flex h-6 cursor-pointer items-center justify-center"
                        onDoubleClick={handleTimeDoubleClick}
                      >
                        {isEditingTime ? (
                          <input
                            ref={timeInputRef}
                            type="time"
                            defaultValue={`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`}
                            className="w-24 rounded border px-1 text-center"
                            onBlur={(blurEvent) => handleTimeInputConfirm(blurEvent.currentTarget.value)}
                            onKeyDown={(keyEvent) => {
                              if (keyEvent.key === 'Enter') {
                                handleTimeInputConfirm(keyEvent.currentTarget.value);
                              }
                            }}
                          />
                        ) : (
                          <>
                            {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}{' '}
                            {t('form.input.dateTimePicker.timeSlot')}
                          </>
                        )}
                      </div>
                      <div className="flex flex-row divide-x sm:h-[300px]">
                        <div
                          className="flex w-64 flex-col gap-1 overflow-y-auto overflow-x-hidden p-2 sm:h-[300px] sm:w-auto"
                          onWheel={handleWheel}
                        >
                          {Array.from({ length: 24 }, (_, i) => i)
                            .reverse()
                            .map((hour) => (
                              <TimeValueButton
                                key={hour}
                                value={hour}
                                selectedValue={hours}
                                onSelect={onChangeHour}
                                variant={variant}
                              />
                            ))}
                        </div>

                        <div
                          className="flex w-64 flex-col gap-1 overflow-y-auto overflow-x-hidden p-2 sm:h-[300px] sm:w-auto"
                          onWheel={handleWheel}
                        >
                          {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                            <TimeValueButton
                              key={minute}
                              value={minute}
                              selectedValue={minutes}
                              onSelect={onChangeMinute}
                              variant={variant}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
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
