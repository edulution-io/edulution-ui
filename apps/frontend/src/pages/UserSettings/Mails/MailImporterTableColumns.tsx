import React from 'react';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import { SyncJobDto } from '@libs/mail/types';
import { ColumnDef } from '@tanstack/react-table';

const MailImporterTableColumns: ColumnDef<SyncJobDto>[] = [
  {
    id: 'hostname',
    header: ({ table, column }) => (
      <SortableHeader<SyncJobDto, unknown>
        titleTranslationId="mail.importer.hostname"
        table={table}
        column={column}
      />
    ),
    accessorFn: (row) => row.host1,
    cell: ({ row }) => (
      <SelectableTextCell
        text={row.original.host1}
        row={row}
      />
    ),
  },
  {
    id: 'port',
    header: ({ column }) => (
      <SortableHeader<SyncJobDto, unknown>
        titleTranslationId="mail.importer.port"
        column={column}
      />
    ),
    accessorFn: (row) => row.port1,
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => {}}
        text={`${row.original.port1}`}
      />
    ),
  },
  {
    id: 'encryption',
    header: ({ column }) => (
      <SortableHeader<SyncJobDto, unknown>
        titleTranslationId="mail.importer.encryption"
        column={column}
      />
    ),
    accessorFn: (row) => row.enc1,
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => {}}
        text={`${row.original.enc1}`}
      />
    ),
  },
  {
    id: 'username',
    header: ({ column }) => (
      <SortableHeader<SyncJobDto, unknown>
        titleTranslationId="common.username"
        column={column}
      />
    ),
    accessorFn: (row) => row.user1,
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => {}}
        text={`${row.original.user1}`}
      />
    ),
  },
  {
    id: 'sync-interval',
    header: ({ column }) => (
      <SortableHeader<SyncJobDto, unknown>
        titleTranslationId="mail.importer.interval"
        column={column}
      />
    ),
    accessorFn: (row) => row.mins_interval,
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => {}}
        text={`${row.original.mins_interval} min`}
      />
    ),
  },
  {
    id: 'isActive',
    header: ({ column }) => (
      <SortableHeader<SyncJobDto, unknown>
        titleTranslationId="mail.importer.isActive"
        column={column}
      />
    ),
    accessorFn: (row) => row.active,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className={`flex h-2 w-2 rounded-full ${row.original.active === 1 ? 'bg-ciLightGreen' : 'bg-ciRed'}`} />
      </div>
    ),
  },
];

export default MailImporterTableColumns;
