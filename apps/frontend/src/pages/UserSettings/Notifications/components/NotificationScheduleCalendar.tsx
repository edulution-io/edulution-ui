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

import React, { useMemo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import ALL_WEEKDAYS from '@libs/common/constants/allWeekdays';
import Weekday from '@libs/common/constants/weekday';
import type NotificationScheduleDto from '@libs/user-preferences/types/notification-schedule.dto';
import SCHEDULE_BLOCK_COLORS from '@libs/common/constants/scheduleBlockColors';
import type ScheduleBlock from '@/components/ui/WeeklyScheduleCalendar/types/ScheduleBlock';
import WeeklyScheduleCalendar from '@/components/ui/WeeklyScheduleCalendar/WeeklyScheduleCalendar';
import Switch from '@/components/ui/Switch';
import IconWrapper from '@/components/shared/IconWrapper';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import useUserPreferencesStore from '@/store/useUserPreferencesStore';
import useLanguage from '@/hooks/useLanguage';
import useOrganizationType from '@/hooks/useOrganizationType';
import getDisplayName from '@/utils/getDisplayName';
import NotificationScheduleDialog from '@/pages/UserSettings/Notifications/components/NotificationScheduleDialog';

const DEFAULT_START_TIME = '08:00';
const DEFAULT_END_TIME = '18:00';
const VISIBLE_START_HOUR = 0;
const VISIBLE_END_HOUR = 24;
const BLOCK_ID_SEPARATOR = '::';

interface NotificationScheduleCalendarProps {
  apps: AppConfigDto[];
}

interface DialogState {
  appName: string;
  scheduleIndex: number | null;
  clickedDay?: number;
  prefilledStartTime?: string;
  prefilledEndTime?: string;
}

const encodeBlockId = (appName: string, scheduleIndex: number): string =>
  `${appName}${BLOCK_ID_SEPARATOR}${scheduleIndex}`;

const decodeBlockId = (blockId: string): { appName: string; scheduleIndex: number } => {
  const separatorIdx = blockId.lastIndexOf(BLOCK_ID_SEPARATOR);
  return {
    appName: blockId.substring(0, separatorIdx),
    scheduleIndex: Number(blockId.substring(separatorIdx + BLOCK_ID_SEPARATOR.length)),
  };
};

const NotificationScheduleCalendar = ({ apps }: NotificationScheduleCalendarProps) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { isSchoolEnvironment } = useOrganizationType();
  const { notificationPreferences, updateNotificationPreferences } = useUserPreferencesStore();
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [appPickerOpen, setAppPickerOpen] = useState(false);

  const sortedApps = useMemo(() => [...apps].sort((a, b) => a.name.localeCompare(b.name)), [apps]);

  const dayLabels = useMemo(() => Array.from({ length: 7 }, (_, i) => t(`common.weekdaysShort.${i}`)), [t]);

  const blocks: ScheduleBlock[] = useMemo(() => {
    const result: ScheduleBlock[] = [];

    sortedApps.forEach((app) => {
      const pref = notificationPreferences.apps?.[app.name];
      if (pref?.enabled === false) return;

      const colorIndex = sortedApps.indexOf(app) % SCHEDULE_BLOCK_COLORS.length;
      const color = SCHEDULE_BLOCK_COLORS[colorIndex];
      const label = getDisplayName(app, language, isSchoolEnvironment);
      const schedules = pref?.schedules ?? [];

      if (schedules.length === 0) {
        result.push({
          id: encodeBlockId(app.name, 0),
          label,
          color,
          startTime: DEFAULT_START_TIME,
          endTime: DEFAULT_END_TIME,
          days: [...ALL_WEEKDAYS],
        });
      } else {
        schedules.forEach((schedule, idx) => {
          if (!schedule.enabled) return;
          result.push({
            id: encodeBlockId(app.name, idx),
            label,
            color,
            startTime: schedule.startTime ?? DEFAULT_START_TIME,
            endTime: schedule.endTime ?? DEFAULT_END_TIME,
            days: schedule.days ?? ALL_WEEKDAYS,
          });
        });
      }
    });

    return result;
  }, [sortedApps, notificationPreferences, language, isSchoolEnvironment]);

  const getAppSchedules = useCallback(
    (appName: string): NotificationScheduleDto[] => notificationPreferences.apps?.[appName]?.schedules ?? [],
    [notificationPreferences],
  );

  const handleBlockTimeChange = useCallback((blockId: string, day: number, startTime: string, endTime: string) => {
    const { appName, scheduleIndex } = decodeBlockId(blockId);
    setDialogState({
      appName,
      scheduleIndex,
      clickedDay: day,
      prefilledStartTime: startTime,
      prefilledEndTime: endTime,
    });
  }, []);

  const handleBlockClick = useCallback((blockId: string, day: number) => {
    const { appName, scheduleIndex } = decodeBlockId(blockId);
    setDialogState({ appName, scheduleIndex, clickedDay: day });
  }, []);

  const handleEmptyCellDoubleClick = useCallback(() => {
    setAppPickerOpen(true);
  }, []);

  const handleAppPicked = useCallback((appName: string) => {
    setAppPickerOpen(false);
    setDialogState({ appName, scheduleIndex: null });
  }, []);

  const handleScheduleSave = useCallback(
    (savedSchedules: NotificationScheduleDto[]) => {
      if (!dialogState) return;

      const { appName, scheduleIndex } = dialogState;
      const existingSchedules = [...getAppSchedules(appName)];

      if (scheduleIndex === null) {
        existingSchedules.push(...savedSchedules);
      } else if (scheduleIndex < existingSchedules.length) {
        existingSchedules.splice(scheduleIndex, 1, ...savedSchedules);
      } else {
        existingSchedules.push(...savedSchedules);
      }

      const claimedDays = new Set(savedSchedules.flatMap((s) => s.days));
      const deduplicated = existingSchedules
        .map((schedule, idx) => {
          const isSaved =
            scheduleIndex === null
              ? idx >= existingSchedules.length - savedSchedules.length
              : idx >= scheduleIndex && idx < scheduleIndex + savedSchedules.length;
          if (isSaved) return schedule;
          return { ...schedule, days: schedule.days.filter((d) => !claimedDays.has(d)) };
        })
        .filter((schedule) => schedule.days.length > 0);

      void updateNotificationPreferences({ appName, appSchedules: deduplicated });
    },
    [dialogState, getAppSchedules, updateNotificationPreferences],
  );

  const handleScheduleDelete = useCallback(
    (dayToRemove?: number) => {
      if (!dialogState) return;

      const { appName, scheduleIndex } = dialogState;
      const existingSchedules = [...getAppSchedules(appName)];
      const isDefaultBlock = scheduleIndex !== null && scheduleIndex >= existingSchedules.length;

      if (isDefaultBlock) {
        if (dayToRemove !== undefined) {
          const remainingDays = ALL_WEEKDAYS.filter((d) => d !== dayToRemove);
          void updateNotificationPreferences({
            appName,
            appSchedules: [
              { enabled: true, startTime: DEFAULT_START_TIME, endTime: DEFAULT_END_TIME, days: remainingDays },
            ],
          });
        } else {
          void updateNotificationPreferences({ appName, appEnabled: false });
        }
        return;
      }

      if (scheduleIndex === null) return;

      const schedule = existingSchedules[scheduleIndex];
      if (dayToRemove !== undefined && schedule.days.length > 1) {
        existingSchedules[scheduleIndex] = {
          ...schedule,
          days: schedule.days.filter((d) => d !== (dayToRemove as Weekday)),
        };
      } else {
        existingSchedules.splice(scheduleIndex, 1);
      }

      void updateNotificationPreferences({ appName, appSchedules: existingSchedules });
    },
    [dialogState, getAppSchedules, updateNotificationPreferences],
  );

  const handleAppToggle = useCallback(
    (appName: string, enabled: boolean) => {
      void updateNotificationPreferences({ appName, appEnabled: enabled });
    },
    [updateNotificationPreferences],
  );

  const pushDisabled = !notificationPreferences.pushEnabled;

  const dialogApp = dialogState ? sortedApps.find((app) => app.name === dialogState.appName) : undefined;
  const dialogSchedule = useMemo(() => {
    if (!dialogState || dialogState.scheduleIndex === null) return undefined;
    const saved = getAppSchedules(dialogState.appName)[dialogState.scheduleIndex];
    if (saved) return saved;
    return {
      enabled: true,
      startTime: DEFAULT_START_TIME,
      endTime: DEFAULT_END_TIME,
      days: [...ALL_WEEKDAYS],
    };
  }, [dialogState, getAppSchedules]);

  const enabledApps = sortedApps.filter((app) => notificationPreferences.apps?.[app.name]?.enabled !== false);

  const appPickerBody = (
    <div className="flex flex-col gap-2">
      {enabledApps.map((app) => {
        const color = SCHEDULE_BLOCK_COLORS[sortedApps.indexOf(app) % SCHEDULE_BLOCK_COLORS.length];
        const displayName = getDisplayName(app, language, isSchoolEnvironment);
        return (
          <button
            key={app.name}
            type="button"
            className="hover:bg-muted/50 flex items-center gap-3 rounded-md border border-muted px-4 py-3 text-left transition-colors"
            onClick={() => handleAppPicked(app.name)}
          >
            <div
              className="h-3 w-3 flex-shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <IconWrapper
              iconSrc={app.icon}
              alt={app.name}
              width={24}
              height={24}
            />
            <span className="text-sm text-background">{displayName}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {sortedApps.map((app) => {
          const color = SCHEDULE_BLOCK_COLORS[sortedApps.indexOf(app) % SCHEDULE_BLOCK_COLORS.length];
          const enabled = notificationPreferences.apps?.[app.name]?.enabled !== false;
          const displayName = getDisplayName(app, language, isSchoolEnvironment);

          return (
            <div
              key={app.name}
              className="flex items-center gap-2 rounded-md border border-muted px-3 py-2"
            >
              <div
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <IconWrapper
                iconSrc={app.icon}
                alt={app.name}
                width={20}
                height={20}
              />
              <span className="text-sm text-background">{displayName}</span>
              <Switch
                checked={enabled}
                onCheckedChange={(val) => handleAppToggle(app.name, val)}
                disabled={pushDisabled}
              />
            </div>
          );
        })}
      </div>

      <WeeklyScheduleCalendar
        blocks={blocks}
        onBlockTimeChange={handleBlockTimeChange}
        onBlockClick={handleBlockClick}
        onEmptyCellDoubleClick={handleEmptyCellDoubleClick}
        visibleStartHour={VISIBLE_START_HOUR}
        visibleEndHour={VISIBLE_END_HOUR}
        dayLabels={dayLabels}
        readOnly={pushDisabled}
      />

      <p className="text-xs text-muted-foreground">
        {t('usersettings.notifications.calendar.dragHint')} · {t('usersettings.notifications.calendar.clickDayHint')}
      </p>

      <AdaptiveDialog
        isOpen={appPickerOpen}
        handleOpenChange={() => setAppPickerOpen(false)}
        title={t('usersettings.notifications.calendar.selectApp')}
        body={appPickerBody}
      />

      {dialogApp && dialogState && (
        <NotificationScheduleDialog
          appDisplayName={getDisplayName(dialogApp, language, isSchoolEnvironment)}
          currentSchedule={dialogSchedule}
          clickedDay={dialogState.clickedDay}
          prefilledStartTime={dialogState.prefilledStartTime}
          prefilledEndTime={dialogState.prefilledEndTime}
          isOpen
          onClose={() => setDialogState(null)}
          onSave={handleScheduleSave}
          onDelete={dialogState.clickedDay !== undefined ? handleScheduleDelete : undefined}
        />
      )}
    </div>
  );
};

export default NotificationScheduleCalendar;
