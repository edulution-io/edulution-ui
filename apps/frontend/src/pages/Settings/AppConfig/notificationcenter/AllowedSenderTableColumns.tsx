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
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import AllowedSenderDto from '@libs/notification-center/types/allowedSenderDto';
import ALLOWED_ANNOUNCEMENT_SENDER_TABLE_COLUMNS from '@libs/notification-center/constants/allowedAnnouncementSenderTableColumns';

const AllowedSenderTableColumns: ColumnDef<AllowedSenderDto>[] = [
  {
    id: ALLOWED_ANNOUNCEMENT_SENDER_TABLE_COLUMNS.NAME,
    header: ({ column }) => <SortableHeader<AllowedSenderDto, unknown> column={column} />,
    meta: {
      translationId: 'common.name',
    },
    accessorFn: (row) => row.name,
    cell: ({ row }) => (
      <SelectableTextCell
        text={row.original.name || '-'}
        row={row}
        isFirstColumn
      />
    ),
  },
  {
    id: ALLOWED_ANNOUNCEMENT_SENDER_TABLE_COLUMNS.ALLOWED_GROUPS,
    header: ({ column }) => <SortableHeader<AllowedSenderDto, unknown> column={column} />,
    meta: {
      translationId: 'notificationcenter.allowedGroups',
    },
    accessorFn: (row) => row.allowedGroups?.map((group) => group.label).join(', ') || '-',
    cell: ({ row }) => (
      <SelectableTextCell text={row.original.allowedGroups?.map((group) => group.label).join(', ') || '-'} />
    ),
  },
  {
    id: ALLOWED_ANNOUNCEMENT_SENDER_TABLE_COLUMNS.ALLOWED_USERS,
    header: ({ column }) => <SortableHeader<AllowedSenderDto, unknown> column={column} />,
    meta: {
      translationId: 'notificationcenter.allowedUsers',
    },
    accessorFn: (row) => row.allowedUsers?.map((user) => user.label).join(', ') || '-',
    cell: ({ row }) => (
      <SelectableTextCell text={row.original.allowedUsers?.map((user) => user.label).join(', ') || '-'} />
    ),
  },
];

export default AllowedSenderTableColumns;
