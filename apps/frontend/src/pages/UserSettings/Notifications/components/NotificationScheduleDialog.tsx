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

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type NotificationScheduleDto from '@libs/user-preferences/types/notification-schedule.dto';
import Weekday from '@libs/common/constants/weekday';
import ALL_WEEKDAYS from '@libs/common/constants/allWeekdays';
import DATE_TIME_PICKER_MODE from '@libs/ui/constants/dateTimePickerMode';
import { cn } from '@edulution-io/ui-kit';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import DateTimePickerField from '@/components/ui/DateTimePicker/DateTimePickerField';

const APPLY_SCOPE_ALL = 'all';
const APPLY_SCOPE_SINGLE = 'single';

interface NotificationScheduleDialogProps {
  appDisplayName: string;
  currentSchedule: NotificationScheduleDto | undefined;
  clickedDay?: number;
  prefilledStartTime?: string;
  prefilledEndTime?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedules: NotificationScheduleDto[]) => void;
  onDelete?: (dayToRemove?: number) => void;
}

interface ScheduleFormValues {
  startTime: Date | null;
  endTime: Date | null;
}

const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 18;

const timeStringToDate = (time: string | null, fallbackHour: number): Date => {
  const date = new Date();
  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
  } else {
    date.setHours(fallbackHour, 0, 0, 0);
  }
  return date;
};

const dateToTimeString = (date: Date | null, fallbackHour: number): string => {
  if (!date) {
    return `${String(fallbackHour).padStart(2, '0')}:00`;
  }
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const NotificationScheduleDialog: React.FC<NotificationScheduleDialogProps> = ({
  appDisplayName,
  currentSchedule,
  clickedDay,
  prefilledStartTime,
  prefilledEndTime,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [days, setDays] = useState<Weekday[]>([...ALL_WEEKDAYS]);
  const [applyScope, setApplyScope] = useState(APPLY_SCOPE_ALL);

  const showScopeOption = clickedDay !== undefined && currentSchedule !== undefined && currentSchedule.days.length > 1;

  const form = useForm<ScheduleFormValues>({
    defaultValues: {
      startTime: timeStringToDate(null, DEFAULT_START_HOUR),
      endTime: timeStringToDate(null, DEFAULT_END_HOUR),
    },
  });

  useEffect(() => {
    const startTime = prefilledStartTime ?? currentSchedule?.startTime ?? null;
    const endTime = prefilledEndTime ?? currentSchedule?.endTime ?? null;

    form.reset({
      startTime: timeStringToDate(startTime, DEFAULT_START_HOUR),
      endTime: timeStringToDate(endTime, DEFAULT_END_HOUR),
    });

    if (currentSchedule) {
      setDays(currentSchedule.days);
    } else {
      setDays(clickedDay !== undefined ? [clickedDay as Weekday] : [...ALL_WEEKDAYS]);
    }

    setApplyScope(APPLY_SCOPE_ALL);
  }, [currentSchedule, isOpen]);

  const handleDayToggle = (day: Weekday) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleSave = () => {
    const values = form.getValues();
    const newStartTime = dateToTimeString(values.startTime, DEFAULT_START_HOUR);
    const newEndTime = dateToTimeString(values.endTime, DEFAULT_END_HOUR);

    if (applyScope === APPLY_SCOPE_SINGLE && clickedDay !== undefined && currentSchedule) {
      const clickedWeekday = clickedDay as Weekday;
      const remainingDays = currentSchedule.days.filter((d) => d !== clickedWeekday);
      const result: NotificationScheduleDto[] = [];

      if (remainingDays.length > 0) {
        result.push({
          enabled: true,
          startTime: currentSchedule.startTime,
          endTime: currentSchedule.endTime,
          days: remainingDays,
        });
      }

      result.push({
        enabled: true,
        startTime: newStartTime,
        endTime: newEndTime,
        days: [clickedWeekday],
      });

      onSave(result);
    } else {
      onSave([
        {
          enabled: true,
          startTime: newStartTime,
          endTime: newEndTime,
          days,
        },
      ]);
    }

    onClose();
  };

  const body = (
    <div className="flex flex-col divide-y divide-muted">
      {showScopeOption && (
        <div className="flex items-center gap-4 py-3">
          <span className="text-background">{t('usersettings.notifications.schedule.applyTo')}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setApplyScope(APPLY_SCOPE_ALL)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                applyScope === APPLY_SCOPE_ALL
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {t('usersettings.notifications.schedule.allDays')}
            </button>
            <button
              type="button"
              onClick={() => setApplyScope(APPLY_SCOPE_SINGLE)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                applyScope === APPLY_SCOPE_SINGLE
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {t('usersettings.notifications.schedule.onlyDay', {
                day: t(`common.weekdaysShort.${clickedDay}`),
              })}
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between py-3">
        <span className="text-background">{t('usersettings.notifications.schedule.startTime')}</span>
        <DateTimePickerField
          form={form}
          path="startTime"
          mode={DATE_TIME_PICKER_MODE.TIME}
          variant="dialog"
          allowPast
        />
      </div>
      <div className="flex items-center justify-between py-3">
        <span className="text-background">{t('usersettings.notifications.schedule.endTime')}</span>
        <DateTimePickerField
          form={form}
          path="endTime"
          mode={DATE_TIME_PICKER_MODE.TIME}
          variant="dialog"
          allowPast
        />
      </div>
      {applyScope === APPLY_SCOPE_ALL && (
        <div className="flex items-center justify-between py-3">
          <span className="text-background">{t('usersettings.notifications.schedule.days')}</span>
          <div className="flex gap-1.5">
            {ALL_WEEKDAYS.map((day) => {
              const isActive = days.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition-colors',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {t(`common.weekdaysShort.${day}`)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const handleDelete = () => {
    if (applyScope === APPLY_SCOPE_SINGLE && clickedDay !== undefined) {
      onDelete?.(clickedDay);
    } else {
      onDelete?.();
    }
    onClose();
  };

  const footer = (
    <DialogFooterButtons
      handleClose={onClose}
      handleSubmit={handleSave}
      handleDelete={onDelete ? handleDelete : undefined}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={onClose}
      title={t('usersettings.notifications.schedule.title', { app: appDisplayName })}
      body={body}
      footer={footer}
    />
  );
};

export default NotificationScheduleDialog;
