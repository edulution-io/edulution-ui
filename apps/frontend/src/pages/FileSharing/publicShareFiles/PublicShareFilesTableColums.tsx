/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { ColumnDef } from '@tanstack/react-table';
import { PublicSharedFileDto } from '@libs/filesharing/types/publicSharedFileDto';
import PUBLIC_SHARED_FILES_TABLE_COLUMN from '@libs/filesharing/constants/publicSharedFIlesTableColum';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import React from 'react';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';

const PublicShareFilesTableColumns: ColumnDef<PublicSharedFileDto>[] = [
  {
    id: PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_NAME,
    header: ({ table, column }) => (
      <SortableHeader<PublicSharedFileDto, unknown>
        className="min-w-32"
        table={table}
        column={column}
      />
    ),
    meta: {
      translationId: 'filesharing.publicFileSharing.fileName',
    },
    accessorFn: (row) => row.filename,
    cell: ({ row }) => {
      const { filename } = row.original;
      return (
        <SelectableTextCell
          onClick={() => {}}
          text={filename}
          className="min-w-32"
          isFirstColumn
        />
      );
    },
  },
  {
    accessorKey: PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_CREATED_AT,
    header: ({ column }) => (
      <SortableHeader<PublicSharedFileDto, unknown>
        className="min-w-32"
        column={column}
      />
    ),
    meta: {
      translationId: 'filesharing.publicFileSharing.createdAt',
    },
    accessorFn: (row) => row.createdAt,
    cell: ({ row }) => {
      const { createdAt } = row.original;
      return (
        <SelectableTextCell
          text={createdAt.toLocaleString()}
          className="min-w-32"
        />
      );
    },
  },
  {
    accessorKey: PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_VALID_UNTIL,
    header: ({ column }) => (
      <SortableHeader<PublicSharedFileDto, unknown>
        className="min-w-32"
        column={column}
      />
    ),
    meta: {
      translationId: 'filesharing.publicFileSharing.validUntil',
    },
    accessorFn: (row) => row.validUntil,
    cell: ({ row }) => {
      const { validUntil } = row.original;
      return (
        <SelectableTextCell
          text={validUntil ? validUntil.toLocaleString() : '-'}
          className="min-w-32"
        />
      );
    },
  },
  {
    accessorKey: PUBLIC_SHARED_FILES_TABLE_COLUMN.IS_ACTIVE,
    header: ({ column }) => (
      <SortableHeader<PublicSharedFileDto, unknown>
        className="min-w-32"
        column={column}
      />
    ),
    meta: {
      translationId: 'filesharing.publicFileSharing.isActive',
    },
    accessorFn: (row) => (row.validUntil ? new Date(row.validUntil) > new Date() : true),
    cell: ({ row }) => {
      const isActive = row.original.validUntil ? new Date(row.original.validUntil) > new Date() : true;
      return (
        <SelectableTextCell
          text={isActive ? 'Yes' : 'No'}
          className="min-w-32"
        />
      );
    },
  },

  {
    accessorKey: PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_LINK,
    header: ({ column }) => (
      <SortableHeader<PublicSharedFileDto, unknown>
        className="min-w-32"
        column={column}
      />
    ),
    meta: {
      translationId: 'filesharing.publicFileSharing.fileLink',
    },
    accessorFn: (row) => row.fileLink,
    cell: ({ row }) => {
      const { fileLink } = row.original;
      return (
        <SelectableTextCell
          text={fileLink}
          className="min-w-32"
        />
      );
    },
  },
];

export default PublicShareFilesTableColumns;
