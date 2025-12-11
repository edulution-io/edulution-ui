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

import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import { Form, FormControl, FormFieldSH, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import Switch from '@/components/ui/Switch';
import Input from '@/components/shared/Input';
import DndTimeWindow from '@libs/notification/types/dndTimeWindow';
import useNotificationSettingsStore from '@/pages/UserSettings/Notifications/useNotificationSettingsStore';
import getRandomUUID from '@/utils/getRandomUUID';
import DateTimePickerField from '@/components/ui/DateTimePicker/DateTimePickerField';
import DayTimePickerMode from '@libs/common/constants/dayTimePickerMode';

interface AddDndTimeWindowDialogProps {
  isOpen: boolean;
  editingTimeWindow: DndTimeWindow | null;
  handleOpenChange: () => void;
}

const DAYS = [
  { value: 1, labelKey: 'common.days.mo' },
  { value: 2, labelKey: 'common.days.tu' },
  { value: 3, labelKey: 'common.days.we' },
  { value: 4, labelKey: 'common.days.th' },
  { value: 5, labelKey: 'common.days.fr' },
  { value: 6, labelKey: 'common.days.sa' },
  { value: 0, labelKey: 'common.days.su' },
];

const getDndTimeWindowFormSchema = (t: (key: string) => string) =>
  z.object({
    label: z.string().optional(),
    days: z.array(z.number()).min(1, t('usersettings.notifications.dnd.validation.daysRequired')),
    startTime: z.string().min(1, t('usersettings.notifications.dnd.validation.startTimeRequired')),
    endTime: z.string().min(1, t('usersettings.notifications.dnd.validation.endTimeRequired')),
    bufferNotifications: z.boolean(),
  });

type DndTimeWindowFormValues = {
  label: string;
  days: number[];
  startTime: string;
  endTime: string;
  bufferNotifications: boolean;
};

const AddDndTimeWindowDialog: FC<AddDndTimeWindowDialogProps> = ({ isOpen, editingTimeWindow, handleOpenChange }) => {
  const { t } = useTranslation();
  const { notificationSettings, updateNotificationSettings } = useNotificationSettingsStore();

  const isEditing = Boolean(editingTimeWindow?.id);

  const form = useForm<DndTimeWindowFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(getDndTimeWindowFormSchema(t)),
    defaultValues: {
      label: editingTimeWindow?.label ?? '',
      days: editingTimeWindow?.days ?? [1, 2, 3, 4, 5],
      startTime: editingTimeWindow?.startTime ?? '22:00',
      endTime: editingTimeWindow?.endTime ?? '07:00',
      bufferNotifications: editingTimeWindow?.bufferNotifications ?? true,
    },
  });

  const watchedDays = form.watch('days');

  const handleClose = () => {
    handleOpenChange();
  };

  const onSubmit = async (data: DndTimeWindowFormValues) => {
    if (!notificationSettings) return;

    const newTimeWindow: DndTimeWindow = {
      id: editingTimeWindow?.id ?? getRandomUUID(),
      label: data.label || '',
      days: data.days,
      startTime: data.startTime,
      endTime: data.endTime,
      bufferNotifications: data.bufferNotifications,
    };

    const existingWindows = notificationSettings.dndTimeWindows ?? [];

    let updatedWindows: DndTimeWindow[];
    if (isEditing && editingTimeWindow?.id) {
      updatedWindows = existingWindows.map((w) => (w.id === editingTimeWindow.id ? newTimeWindow : w));
    } else {
      updatedWindows = [...existingWindows, newTimeWindow];
    }

    await updateNotificationSettings({
      ...notificationSettings,
      dndTimeWindows: updatedWindows,
    });

    handleClose();
  };

  const handleDayToggle = (day: number) => {
    const currentDays = form.getValues('days');
    const newDays = currentDays.includes(day) ? currentDays.filter((d) => d !== day) : [...currentDays, day];
    form.setValue('days', newDays, { shouldValidate: true });
  };

  const getDialogBody = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <FormFieldSH
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('usersettings.notifications.dnd.table.label')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('usersettings.notifications.dnd.labelPlaceholder')}
                    className="bg-ciDarkGrey"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>{t('usersettings.notifications.dnd.table.days')}</FormLabel>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleDayToggle(day.value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    watchedDays.includes(day.value)
                      ? 'bg-ciLightBlue text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {t(day.labelKey)}
                </button>
              ))}
            </div>
            {form.formState.errors.days && <p className="text-sm text-red-500">{form.formState.errors.days.message}</p>}
          </FormItem>

          <div className="flex gap-4">
            <div className="flex-1">
              <DateTimePickerField
                form={form}
                path="startTime"
                mode={DayTimePickerMode.Time}
                translationId="usersettings.notifications.dnd.table.startTime"
              />
            </div>
            <div className="flex-1">
              <DateTimePickerField
                form={form}
                path="endTime"
                mode={DayTimePickerMode.Time}
                translationId="usersettings.notifications.dnd.table.endTime"
              />
            </div>
          </div>

          <FormFieldSH
            control={form.control}
            name="bufferNotifications"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="cursor-pointer">{t('usersettings.notifications.dnd.bufferLabel')}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
                <p className="text-xs text-gray-400">{t('usersettings.notifications.dnd.bufferDescription')}</p>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );

  const getFooter = () => (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <DialogFooterButtons
        handleClose={handleClose}
        cancelButtonText="common.cancel"
        handleSubmit={() => {}}
        submitButtonType="submit"
        submitButtonText="common.save"
      />
    </form>
  );

  return (
    <AdaptiveDialog
      body={getDialogBody()}
      footer={getFooter()}
      isOpen={isOpen}
      handleOpenChange={handleClose}
      title={t(isEditing ? 'usersettings.notifications.dnd.editTitle' : 'usersettings.notifications.dnd.addTitle')}
    />
  );
};

export default AddDndTimeWindowDialog;
