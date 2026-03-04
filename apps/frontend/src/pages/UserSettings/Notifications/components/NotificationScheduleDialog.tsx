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

interface NotificationScheduleDialogProps {
  appDisplayName: string;
  currentSchedule: NotificationScheduleDto | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: NotificationScheduleDto) => void;
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
  isOpen,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [days, setDays] = useState<Weekday[]>([...ALL_WEEKDAYS]);

  const form = useForm<ScheduleFormValues>({
    defaultValues: {
      startTime: timeStringToDate(null, DEFAULT_START_HOUR),
      endTime: timeStringToDate(null, DEFAULT_END_HOUR),
    },
  });

  useEffect(() => {
    if (currentSchedule) {
      form.reset({
        startTime: timeStringToDate(currentSchedule.startTime, DEFAULT_START_HOUR),
        endTime: timeStringToDate(currentSchedule.endTime, DEFAULT_END_HOUR),
      });
      setDays(currentSchedule.days);
    } else {
      form.reset({
        startTime: timeStringToDate(null, DEFAULT_START_HOUR),
        endTime: timeStringToDate(null, DEFAULT_END_HOUR),
      });
      setDays([...ALL_WEEKDAYS]);
    }
  }, [currentSchedule, isOpen]);

  const handleDayToggle = (day: Weekday) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleSave = () => {
    const values = form.getValues();
    onSave({
      enabled: true,
      startTime: dateToTimeString(values.startTime, DEFAULT_START_HOUR),
      endTime: dateToTimeString(values.endTime, DEFAULT_END_HOUR),
      days,
    });
    onClose();
  };

  const body = (
    <div className="flex flex-col divide-y divide-muted">
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
    </div>
  );

  const footer = (
    <DialogFooterButtons
      handleClose={onClose}
      handleSubmit={handleSave}
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
