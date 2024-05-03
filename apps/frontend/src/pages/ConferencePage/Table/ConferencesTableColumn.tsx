import { Conference } from '@/pages/ConferencePage/model';
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { LockClosedIcon, LockOpen1Icon } from '@radix-ui/react-icons';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';

const MeetingsTableColumns: ColumnDef<Conference>[] = [
  {
    id: 'meeting-name',
    header: ({ table, column }) => (
      <SortableHeader<Conference, unknown>
        titleTranslationId="conferences.name"
        table={table}
        column={column}
      />
    ),
    accessorFn: (row) => row.meetingName,
    cell: ({ row }) => (
      <SelectableTextCell
        text={row.original.meetingName}
        row={row}
      />
    ),
  },
  {
    id: 'meeting-creator',
    header: ({ column }) => (
      <SortableHeader<Conference, unknown>
        titleTranslationId="conferences.creator"
        column={column}
      />
    ),
    accessorFn: (row) => row.creator,
    cell: ({ row }) => <SelectableTextCell text={row.original.creator} />,
  },
  {
    id: 'meeting-password',
    header: ({ column }) => (
      <SortableHeader<Conference, unknown>
        titleTranslationId="conferences.password"
        column={column}
      />
    ),
    accessorFn: (row) => row.creator,
    cell: ({ row }) => {
      const iconSize = 16;
      return (
        <SelectableTextCell
          text={row.original.password}
          icon={
            row.original.password ? (
              <LockClosedIcon
                width={iconSize}
                height={iconSize}
              />
            ) : (
              <LockOpen1Icon
                width={iconSize}
                height={iconSize}
              />
            )
          }
        />
      );
    },
  },
  {
    id: 'meeting-attendees',
    header: ({ column }) => (
      <SortableHeader<Conference, unknown>
        titleTranslationId="conferences.attendees"
        column={column}
      />
    ),
    accessorFn: (row) => row.attendees.length,
    cell: ({ row }) => <SelectableTextCell text={`${row.original.attendees.length || '-'}`} />,
  },
];

export default MeetingsTableColumns;
