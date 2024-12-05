import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { IoEyeSharp } from 'react-icons/io5';
import { FaEyeSlash } from 'react-icons/fa';
import formatDate from '@libs/common/utils/formatDate';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';

const bulletinBoardEditorialTableColumns: ColumnDef<BulletinResponseDto>[] = [
  {
    id: 'name',
    header: ({ column, table }) => (
      <SortableHeader<BulletinResponseDto, unknown>
        titleTranslationId="bulletinboard.name"
        column={column}
        table={table}
      />
    ),
    accessorFn: (row) => row.heading,
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => {}}
        text={row.original.heading}
        isFirstColumn
        row={row}
      />
    ),
  },
  {
    id: 'isActive',
    header: ({ column }) => (
      <SortableHeader<BulletinResponseDto, unknown>
        titleTranslationId="bulletinboard.isActive"
        column={column}
      />
    ),
    accessorFn: (row) => row.isActive,
    cell: ({ row }) => (
      <SelectableTextCell
        icon={
          row.original.isActive ? <IoEyeSharp className="text-green-500" /> : <FaEyeSlash className="text-red-500" />
        }
      />
    ),
  },
  {
    id: 'createdAt',
    header: ({ column }) => (
      <SortableHeader<BulletinResponseDto, unknown>
        titleTranslationId="common.createdAt"
        column={column}
      />
    ),
    accessorFn: (row) => row.createdAt,
    cell: ({ row }) => <SelectableTextCell text={formatDate(row.original.createdAt?.toString() || '')} />,
  },
];

export default bulletinBoardEditorialTableColumns;
