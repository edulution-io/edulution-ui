// frontend: pages/NotificationCenter/CreatedAnnouncementsTableColumns.tsx

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import AnnouncementDto from '@libs/notification-center/types/announcementDto';
import CREATED_ANNOUNCEMENTS_TABLE_COLUMNS from '@libs/notification-center/constants/createdAnnouncementsTableColumns';
import formatIsoDateToLocaleString from '@libs/common/utils/Date/formatIsoDateToLocaleString';

const CreatedAnnouncementsTableColumns: ColumnDef<AnnouncementDto>[] = [
  {
    id: CREATED_ANNOUNCEMENTS_TABLE_COLUMNS.TITLE,
    header: ({ table, column }) => (
      <SortableHeader<AnnouncementDto, unknown>
        className="min-w-32"
        table={table}
        column={column}
      />
    ),
    meta: {
      translationId: 'notificationcenter.title',
    },
    accessorFn: (row) => row.title,
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => row.toggleSelected()}
        text={row.original.title}
        row={row}
        className="min-w-32"
        isFirstColumn
      />
    ),
  },
  {
    id: CREATED_ANNOUNCEMENTS_TABLE_COLUMNS.CHANNELS,
    header: ({ column }) => <SortableHeader<AnnouncementDto, unknown> column={column} />,
    meta: {
      translationId: 'notificationcenter.channels',
    },
    accessorFn: (row) => row.channels?.length || 0,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const channels = row.original.channels || [];
      const displayText = channels.map((c) => t(`notificationcenter.channel.${c}`)).join(', ');
      return (
        <SelectableTextCell
          onClick={() => row.toggleSelected()}
          text={displayText || '-'}
        />
      );
    },
  },
  {
    id: CREATED_ANNOUNCEMENTS_TABLE_COLUMNS.RECIPIENTS_COUNT,
    size: 120,
    header: ({ column }) => <SortableHeader<AnnouncementDto, unknown> column={column} />,
    meta: {
      translationId: 'notificationcenter.recipientsCount',
    },
    accessorFn: (row) => row.recipientsCount,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const usersCount = row.original.recipientUsers?.length || 0;
      const groupsCount = row.original.recipientGroups?.length || 0;

      const usersText = `${usersCount} ${t('common.users')}`;
      const groupsText = groupsCount
        ? `, ${groupsCount} ${t(groupsCount === 1 ? 'common.group' : 'common.groups')}`
        : '';

      return (
        <SelectableTextCell
          onClick={() => row.toggleSelected()}
          text={`${usersText}${groupsText}`}
        />
      );
    },
  },
  {
    id: CREATED_ANNOUNCEMENTS_TABLE_COLUMNS.CREATED_AT,
    header: ({ column }) => <SortableHeader<AnnouncementDto, unknown> column={column} />,
    meta: {
      translationId: 'notificationcenter.sentAt',
    },
    accessorFn: (row) => row.createdAt,
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return (
        <SelectableTextCell
          onClick={() => row.toggleSelected()}
          text={formatIsoDateToLocaleString(date.toString())}
        />
      );
    },
  },
];

export default CreatedAnnouncementsTableColumns;
