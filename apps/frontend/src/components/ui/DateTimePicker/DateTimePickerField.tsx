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

import React, { useCallback, useMemo, useState } from 'react';
import { de, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { DeleteIcon } from '@libs/common/constants/standardActionIcons';
import { CalendarIcon, ClockIcon } from '@radix-ui/react-icons';
import { inputVariants } from '@libs/ui/constants/commonClassNames';
import DropdownVariant from '@libs/ui/types/DropdownVariant';
import cn from '@libs/common/utils/className';
import safeGetHours from '@libs/common/utils/Date/safeGetHours';
import safeGetMinutes from '@libs/common/utils/Date/safeGetMinutes';
import safeGetDate from '@libs/common/utils/Date/safeGetDate';
import formatDateByMode from '@libs/common/utils/Date/formatDateByMode';
import { HOURS, MINUTES } from '@libs/common/constants/timeValues';
import DayTimePickerMode from '@libs/common/constants/dayTimePickerMode';
import { DayTimePickerModeType } from '@libs/common/types/dayTimePickerModeType';
import useLanguage from '@/hooks/useLanguage';
import { Button } from '@/components/shared/Button';
import { Calendar } from '@/components/ui/Calendar';
import { FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import TimeSelector from '@/components/ui/DateTimePicker/TimeSelector';

const TRIGGER_ICONS: Record<DayTimePickerModeType, typeof CalendarIcon> = {
  [DayTimePickerMode.Date]: CalendarIcon,
  [DayTimePickerMode.Time]: ClockIcon,
  [DayTimePickerMode.DateTime]: CalendarIcon,
};

interface DateTimePickerFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  path: Path<T>;
  mode?: DayTimePickerModeType;
  translationId?: string;
  variant?: DropdownVariant;
  allowPast?: boolean;
  isDateRequired?: boolean;
  placeholder?: string;
}

const DateTimePickerField = <T extends FieldValues>(props: DateTimePickerFieldProps<T>) => {
  const {
    form,
    path,
    mode = DayTimePickerMode.DateTime,
    translationId,
    variant = 'default',
    isDateRequired,
    allowPast,
    placeholder,
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  const { t } = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'de' ? de : enUS;

  const fieldValue = form.watch(path);
  const hours = safeGetHours(fieldValue);
  const minutes = safeGetMinutes(fieldValue);

  const showDate = mode === DayTimePickerMode.DateTime || mode === DayTimePickerMode.Date;
  const showTime = mode === DayTimePickerMode.DateTime || mode === DayTimePickerMode.Time;

  const TriggerIcon = TRIGGER_ICONS[mode];

  const handleClear = useCallback(() => {
    form.setValue(path, null as PathValue<T, Path<T>>, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [form, path]);

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

  const isDateDisabled = useCallback(
    (date: Date) => {
      if (allowPast) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    },
    [allowPast],
  );

  const timeDisplay = useMemo((): string => {
    if (!fieldValue) {
      return placeholder || t('form.input.dateTimePicker.placeholder');
    }
    return formatDateByMode(new Date(fieldValue), mode, language);
  }, [fieldValue, language, mode, placeholder, t]);

  const isDialogVariant = variant === 'dialog';

  return (
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
          if (!allowPast && showDate && date.getTime() < Date.now()) {
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
                  inputVariants({ variant: variant === 'dialog' ? 'dialog' : 'default' }),
                  isOpen ? 'border-ring' : 'border-transparent',
                )}
              >
                <Button
                  variant="btn-outline"
                  className={cn(
                    'my-0 h-10 w-fit rounded-lg px-3 py-0 pl-3 text-left font-normal',
                    !fieldValue && 'text-muted-foreground',
                  )}
                >
                  {timeDisplay}
                  <DeleteIcon
                    className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                    onClick={(event) => {
                      event.preventDefault();
                      handleClear();
                    }}
                    visibility={fieldValue ? 'visible' : 'hidden'}
                  />
                  <TriggerIcon className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" />
                </Button>
              </FormControl>
            </PopoverTrigger>

            <PopoverContent
              className={cn(
                'w-auto p-0',
                isDialogVariant ? 'border-ring bg-muted text-secondary' : 'bg-muted-dialog text-secondary',
              )}
            >
              <div className={cn(showDate && showTime && 'sm:flex')}>
                {showDate && (
                  <Calendar
                    mode="single"
                    selected={fieldValue && (fieldValue as unknown) instanceof Date ? fieldValue : undefined}
                    onSelect={handleDateSelect}
                    initialFocus
                    disabled={isDateDisabled}
                    locale={locale}
                    variant={variant}
                  />
                )}

                {showTime && (
                  <div
                    className={cn(
                      'flex',
                      showDate && 'border-t sm:border-l sm:border-t-0',
                      isDialogVariant ? 'border-ring' : 'border-muted',
                    )}
                  >
                    <TimeSelector
                      value={hours}
                      values={HOURS}
                      onChange={onChangeHour}
                      variant={variant}
                      label={t('form.input.dateTimePicker.hours')}
                    />

                    <div className={cn('w-px', isDialogVariant ? 'bg-ring' : 'bg-muted')} />

                    <TimeSelector
                      value={minutes}
                      values={MINUTES}
                      onChange={onChangeMinute}
                      variant={variant}
                      padStart
                      label={t('form.input.dateTimePicker.minutes')}
                    />
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DateTimePickerField;
