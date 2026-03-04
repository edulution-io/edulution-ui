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

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import type NotificationScheduleDto from '@libs/user-preferences/types/notification-schedule.dto';
import Weekday from '@libs/common/constants/weekday';
import APP_NOTIFICATIONS_TABLE_COLUMNS from '@libs/user-preferences/constants/appNotificationsTableColumns';
import hideOnMobileClassName from '@libs/ui/constants/hideOnMobileClassName';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import IconWrapper from '@/components/shared/IconWrapper';
import Switch from '@/components/ui/Switch';
import useUserPreferencesStore from '@/store/useUserPreferencesStore';

type AppNotificationRow = {
  name: string;
  icon: string;
  displayName: string;
  enabled: boolean;
  schedule: NotificationScheduleDto | undefined;
};

const WEEKDAY_COLUMNS: { id: string; weekday: Weekday }[] = [
  { id: APP_NOTIFICATIONS_TABLE_COLUMNS.MONDAY, weekday: Weekday.Monday },
  { id: APP_NOTIFICATIONS_TABLE_COLUMNS.TUESDAY, weekday: Weekday.Tuesday },
  { id: APP_NOTIFICATIONS_TABLE_COLUMNS.WEDNESDAY, weekday: Weekday.Wednesday },
  { id: APP_NOTIFICATIONS_TABLE_COLUMNS.THURSDAY, weekday: Weekday.Thursday },
  { id: APP_NOTIFICATIONS_TABLE_COLUMNS.FRIDAY, weekday: Weekday.Friday },
  { id: APP_NOTIFICATIONS_TABLE_COLUMNS.SATURDAY, weekday: Weekday.Saturday },
  { id: APP_NOTIFICATIONS_TABLE_COLUMNS.SUNDAY, weekday: Weekday.Sunday },
];

const weekdayColumns: ColumnDef<AppNotificationRow>[] = WEEKDAY_COLUMNS.map(({ id, weekday }) => ({
  id,
  meta: { translationId: `common.weekdaysShort.${weekday}` },
  header: ({ column }) => (
    <SortableHeader<AppNotificationRow, unknown>
      column={column}
      className={hideOnMobileClassName}
    />
  ),
  size: 60,
  enableSorting: false,
  cell: ({ row }) => {
    const { schedule } = row.original;
    if (!schedule?.enabled || !schedule.days.includes(weekday)) return <span className={hideOnMobileClassName}>–</span>;

    return (
      <span className={`${hideOnMobileClassName} flex-col text-xs leading-tight`}>
        <span>{schedule.startTime}</span>
        <span>{schedule.endTime}</span>
      </span>
    );
  },
}));

const AppNotificationsTableColumns: ColumnDef<AppNotificationRow>[] = [
  {
    id: APP_NOTIFICATIONS_TABLE_COLUMNS.APP,
    meta: { translationId: 'usersettings.notifications.table.app' },
    accessorKey: 'displayName',
    header: ({ column }) => <SortableHeader<AppNotificationRow, unknown> column={column} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <IconWrapper
          iconSrc={row.original.icon}
          alt={row.original.name}
          width={24}
          height={24}
        />
        {row.original.displayName}
      </div>
    ),
    enableSorting: true,
  },
  ...weekdayColumns,
  {
    id: APP_NOTIFICATIONS_TABLE_COLUMNS.ACTIVE,
    meta: { translationId: 'usersettings.notifications.table.active' },
    header: ({ column }) => <SortableHeader<AppNotificationRow, unknown> column={column} />,
    size: 80,
    enableSorting: false,
    cell: ({ row }) => {
      const { notificationPreferences, updateNotificationPreferences } = useUserPreferencesStore();
      const disabled = !notificationPreferences.pushEnabled;

      return (
        <Switch
          checked={row.original.enabled}
          onCheckedChange={(enabled) => {
            void updateNotificationPreferences({ appName: row.original.name, appEnabled: enabled });
          }}
          disabled={disabled}
          onClick={(e) => e.stopPropagation()}
        />
      );
    },
  },
];

export type { AppNotificationRow };
export default AppNotificationsTableColumns;
