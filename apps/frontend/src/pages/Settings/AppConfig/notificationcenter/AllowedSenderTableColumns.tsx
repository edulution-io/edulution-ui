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
