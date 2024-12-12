import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { IoEyeSharp } from 'react-icons/io5';
import { FaEyeSlash } from 'react-icons/fa';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';
import { FaClock } from 'react-icons/fa6';

const bulletinBoardEditorialTableColumns: ColumnDef<BulletinResponseDto>[] = [
  {
    id: 'name',
    header: ({ column, table }) => (
      <SortableHeader<BulletinResponseDto, unknown>
        column={column}
        table={table}
      />
    ),

    meta: {
      translationId: 'bulletinboard.name',
    },

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
    header: ({ column }) => <SortableHeader<BulletinResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'bulletinboard.category',
    },

    accessorFn: (row) => row.category.name,
    cell: ({ row }) => {
      const { setIsCreateBulletinDialogOpen, setSelectedBulletinToEdit } = useBulletinBoardEditorialStore();
      return (
        <SelectableTextCell
          text={row.original.category?.name}
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
    header: ({ column }) => <SortableHeader<BulletinResponseDto, unknown> column={column} />,

    meta: {
      translationId: 'bulletinboard.isActiveOrExpired',
    },
    accessorFn: (row) => {
      const currentDate = new Date();
      const startDate = row.isVisibleStartDate ? new Date(row.isVisibleStartDate) : null;
      const endDate = row.isVisibleEndDate ? new Date(row.isVisibleEndDate) : null;
      const isExpired = (startDate && currentDate < startDate) || (endDate && currentDate > endDate);
      return row.isActive && !isExpired;
    },
    cell: ({ row: { original } }) => {
      const { setIsCreateBulletinDialogOpen, setSelectedBulletinToEdit } = useBulletinBoardEditorialStore();

      const currentDate = new Date();
      const startDate = original.isVisibleStartDate ? new Date(original.isVisibleStartDate) : null;
      const endDate = original.isVisibleEndDate ? new Date(original.isVisibleEndDate) : null;
      const isExpired = (startDate && currentDate < startDate) || (endDate && currentDate > endDate);

      const isActiveIcon = original.isActive ? (
        <IoEyeSharp className="text-green-500" />
      ) : (
        <FaEyeSlash className="text-red-500" />
      );

      return (
        <SelectableTextCell
          icon={isExpired ? <FaClock className="text-red-500" /> : isActiveIcon}
          onClick={() => {
            setIsCreateBulletinDialogOpen(true);
            setSelectedBulletinToEdit(original);
          }}
        />
      );
    },
  },
  {
    id: 'isVisibleStartDate',
    header: ({ column }) => <SortableHeader<BulletinResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'bulletinboard.isVisibleStartDate',
    },
    accessorFn: (row) => row.isVisibleStartDate,
    cell: ({ row: { original } }) => {
      const { setIsCreateBulletinDialogOpen, setSelectedBulletinToEdit } = useBulletinBoardEditorialStore();
      return (
        <SelectableTextCell
          text={original.isVisibleStartDate ? new Date(original.isVisibleStartDate).toLocaleString() : ''}
          onClick={() => {
            setIsCreateBulletinDialogOpen(true);
            setSelectedBulletinToEdit(original);
          }}
        />
      );
    },
  },
  {
    id: 'isVisibleEndDate',
    header: ({ column }) => <SortableHeader<BulletinResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'bulletinboard.isVisibleEndDate',
    },
    accessorFn: (row) => row.isVisibleEndDate,
    cell: ({ row: { original } }) => {
      const { setIsCreateBulletinDialogOpen, setSelectedBulletinToEdit } = useBulletinBoardEditorialStore();
      return (
        <SelectableTextCell
          text={original.isVisibleEndDate ? new Date(original.isVisibleEndDate).toLocaleString() : ''}
          onClick={() => {
            setIsCreateBulletinDialogOpen(true);
            setSelectedBulletinToEdit(original);
          }}
        />
      );
    },
  },
];

export default bulletinBoardEditorialTableColumns;
