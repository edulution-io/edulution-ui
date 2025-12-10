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
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import DndTimeWindow from '@libs/notification/types/dndTimeWindow';
import DND_TIME_WINDOW_TABLE_COLUMNS from '@libs/notification/constants/dndTimeWindowTableColumns';
import i18n from '@/i18n';
import { CheckIcon, XIcon } from 'lucide-react';

const DAY_LABELS = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];

const formatDays = (days: number[]): string => {
  const sortedDays = [...days].sort((a, b) => a - b);
  return sortedDays.map((d) => i18n.t(`common.days.${DAY_LABELS[d]}`)).join(', ');
};

const DndTimeWindowsTableColumns: ColumnDef<DndTimeWindow>[] = [
  {
    id: DND_TIME_WINDOW_TABLE_COLUMNS.LABEL,
    header: ({ table, column }) => (
      <SortableHeader<DndTimeWindow, unknown>
        table={table}
        column={column}
      />
    ),
    meta: {
      translationId: 'usersettings.notifications.dnd.table.label',
    },
    accessorFn: (row) => row.label,
    cell: ({ row }) => (
      <SelectableTextCell
        text={row.original.label || '-'}
        row={row}
      />
    ),
  },
  {
    id: DND_TIME_WINDOW_TABLE_COLUMNS.DAYS,
    header: ({ column }) => <SortableHeader<DndTimeWindow, unknown> column={column} />,
    meta: {
      translationId: 'usersettings.notifications.dnd.table.days',
    },
    accessorFn: (row) => row.days.join(','),
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => {}}
        text={formatDays(row.original.days)}
      />
    ),
  },
  {
    id: DND_TIME_WINDOW_TABLE_COLUMNS.START_TIME,
    size: 80,
    header: ({ column }) => <SortableHeader<DndTimeWindow, unknown> column={column} />,
    meta: {
      translationId: 'usersettings.notifications.dnd.table.startTime',
    },
    accessorFn: (row) => row.startTime,
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => {}}
        text={row.original.startTime}
      />
    ),
  },
  {
    id: DND_TIME_WINDOW_TABLE_COLUMNS.END_TIME,
    size: 80,
    header: ({ column }) => <SortableHeader<DndTimeWindow, unknown> column={column} />,
    meta: {
      translationId: 'usersettings.notifications.dnd.table.endTime',
    },
    accessorFn: (row) => row.endTime,
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => {}}
        text={row.original.endTime}
      />
    ),
  },
  {
    id: DND_TIME_WINDOW_TABLE_COLUMNS.BUFFER_NOTIFICATIONS,
    size: 100,
    header: ({ column }) => <SortableHeader<DndTimeWindow, unknown> column={column} />,
    meta: {
      translationId: 'usersettings.notifications.dnd.table.buffer',
    },
    accessorFn: (row) => row.bufferNotifications,
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.original.bufferNotifications ? (
          <CheckIcon className="h-4 w-4 text-ciLightGreen" />
        ) : (
          <XIcon className="h-4 w-4 text-ciRed" />
        )}
      </div>
    ),
  },
];

export default DndTimeWindowsTableColumns;
