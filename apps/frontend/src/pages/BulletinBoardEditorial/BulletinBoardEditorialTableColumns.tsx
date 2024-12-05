import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { IoEyeSharp } from 'react-icons/io5';
import { FaEyeSlash } from 'react-icons/fa';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';

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
    accessorFn: (row) => row.title,
    cell: ({ row }) => {
      const { setIsCreateBulletinDialogOpen, setSelectedBulletinToEdit } = useBulletinBoardEditorialStore();
      return (
        <SelectableTextCell
          onClick={() => {
            setIsCreateBulletinDialogOpen(true);
            setSelectedBulletinToEdit(row.original);
          }}
          text={row.original.title}
          isFirstColumn
          row={row}
        />
      );
    },
  },
  {
    id: 'category',
    header: ({ column }) => (
      <SortableHeader<BulletinResponseDto, unknown>
        titleTranslationId="bulletinboard.category"
        column={column}
      />
    ),
    accessorFn: (row) => row.category,
    cell: ({ row }) => {
      const { setIsCreateBulletinDialogOpen, setSelectedBulletinToEdit } = useBulletinBoardEditorialStore();
      return (
        <SelectableTextCell
          text={row.original.category.name}
          onClick={() => {
            setIsCreateBulletinDialogOpen(true);
            setSelectedBulletinToEdit(row.original);
          }}
        />
      );
    },
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
    cell: ({ row }) => {
      const { setIsCreateBulletinDialogOpen, setSelectedBulletinToEdit } = useBulletinBoardEditorialStore();
      return (
        <SelectableTextCell
          icon={
            row.original.isActive ? <IoEyeSharp className="text-green-500" /> : <FaEyeSlash className="text-red-500" />
          }
          onClick={() => {
            setIsCreateBulletinDialogOpen(true);
            setSelectedBulletinToEdit(row.original);
          }}
        />
      );
    },
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
    cell: ({ row }) => {
      const { setIsCreateBulletinDialogOpen, setSelectedBulletinToEdit } = useBulletinBoardEditorialStore();
      return (
        <SelectableTextCell
          text={new Date(row.original.createdAt).toLocaleString()}
          onClick={() => {
            setIsCreateBulletinDialogOpen(true);
            setSelectedBulletinToEdit(row.original);
          }}
        />
      );
    },
  },
  {
    id: 'updatedAt',
    header: ({ column }) => (
      <SortableHeader<BulletinResponseDto, unknown>
        titleTranslationId="common.updatedAt"
        column={column}
      />
    ),
    accessorFn: (row) => row.updatedAt,
    cell: ({ row }) => {
      const { setIsCreateBulletinDialogOpen, setSelectedBulletinToEdit } = useBulletinBoardEditorialStore();
      return (
        <SelectableTextCell
          text={new Date(row.original.updatedAt).toLocaleString()}
          onClick={() => {
            setIsCreateBulletinDialogOpen(true);
            setSelectedBulletinToEdit(row.original);
          }}
        />
      );
    },
  },
];

export default bulletinBoardEditorialTableColumns;
