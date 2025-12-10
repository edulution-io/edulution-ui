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

import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import FormField from '@/components/shared/FormField';
import { Form, FormControl, FormFieldSH, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import Switch from '@/components/ui/Switch';
import DndTimeWindow from '@libs/notification/types/dndTimeWindow';
import useNotificationSettingsStore from '@/pages/UserSettings/Notifications/useNotificationSettingsStore';
import getRandomUUID from '@/utils/getRandomUUID';

interface AddDndTimeWindowDialogProps {
  isOpen: boolean;
  isOneRowSelected: boolean;
  keys: string[];
  dndTimeWindows: DndTimeWindow[];
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

const AddDndTimeWindowDialog: FC<AddDndTimeWindowDialogProps> = ({
  isOpen,
  isOneRowSelected,
  keys,
  dndTimeWindows,
  handleOpenChange,
}) => {
  const { t } = useTranslation();
  const { notificationSettings, updateNotificationSettings } = useNotificationSettingsStore();

  const idx = isOneRowSelected ? Number(keys[0]) : undefined;
  const editingTimeWindow = idx !== undefined ? dndTimeWindows[idx] : null;
  const isEditing = editingTimeWindow !== null;

  const initialFormValues: DndTimeWindowFormValues =
    editingTimeWindow !== null
      ? {
          label: editingTimeWindow.label,
          days: editingTimeWindow.days,
          startTime: editingTimeWindow.startTime,
          endTime: editingTimeWindow.endTime,
          bufferNotifications: editingTimeWindow.bufferNotifications,
        }
      : {
          label: '',
          days: [1, 2, 3, 4, 5], // Mo-Fr default
          startTime: '22:00',
          endTime: '07:00',
          bufferNotifications: true,
        };

  const form = useForm<DndTimeWindowFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(getDndTimeWindowFormSchema(t)),
    defaultValues: initialFormValues,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(initialFormValues);
    }
  }, [isOpen, isOneRowSelected, keys]);

  const handleClose = () => {
    handleOpenChange();
    form.reset();
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
    if (isEditing && editingTimeWindow) {
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
          <FormField
            labelTranslationId={t('usersettings.notifications.dnd.table.label')}
            name="label"
            defaultValue={initialFormValues.label}
            form={form}
            variant="dialog"
            placeholder={t('usersettings.notifications.dnd.labelPlaceholder')}
          />

          <FormFieldSH
            control={form.control}
            name="days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('usersettings.notifications.dnd.table.days')}</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => handleDayToggle(day.value)}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                          field.value.includes(day.value)
                            ? 'bg-ciLightBlue text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {t(day.labelKey)}
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <FormField
                labelTranslationId={t('usersettings.notifications.dnd.table.startTime')}
                name="startTime"
                defaultValue={initialFormValues.startTime}
                form={form}
                variant="dialog"
                type="time"
              />
            </div>
            <div className="flex-1">
              <FormField
                labelTranslationId={t('usersettings.notifications.dnd.table.endTime')}
                name="endTime"
                defaultValue={initialFormValues.endTime}
                form={form}
                variant="dialog"
                type="time"
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
