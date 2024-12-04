import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { IoEyeSharp } from 'react-icons/io5';
import { FaEyeSlash } from 'react-icons/fa';
import formatDate from '@libs/common/utils/formatDate';
import useAppConfigBulletinTableStore from '@/pages/BulletinBoard/useAppConfigBulletinTableStore';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import useAppConfigDialogStore from '../Settings/AppConfig/components/table/appConfigDialogStore';

const AppConfigBulletinTableColumn: ColumnDef<BulletinCategoryResponseDto>[] = [
  {
    id: 'name',
    header: ({ column, table }) => (
      <SortableHeader<BulletinCategoryResponseDto, unknown>
        titleTranslationId="bulletinboard.name"
        column={column}
        table={table}
      />
    ),

    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const { setSelectedCategory } = useAppConfigBulletinTableStore();
      const { setUpdateDeleteEntityDialogOpen } = useAppConfigDialogStore();
      const handleRowClick = () => {
        setSelectedCategory(row.original);
        setUpdateDeleteEntityDialogOpen(true);
      };

      return (
        <SelectableTextCell
          onClick={handleRowClick}
          text={row.original.name}
          isFirstColumn
        />
      );
    },
  },
  {
    id: 'isActive',
    header: ({ column }) => (
      <SortableHeader<BulletinCategoryResponseDto, unknown>
        titleTranslationId="bulletinboard.isActive"
        column={column}
      />
    ),
    accessorFn: (row) => row.isActive,
    cell: ({ row }) => {
      const { setSelectedCategory } = useAppConfigBulletinTableStore();
      const { setUpdateDeleteEntityDialogOpen } = useAppConfigDialogStore();
      const handleRowClick = () => {
        setSelectedCategory(row.original);
        setUpdateDeleteEntityDialogOpen(true);
      };
      return (
        <SelectableTextCell
          icon={
            row.original.isActive ? <IoEyeSharp className="text-green-500" /> : <FaEyeSlash className="text-red-500" />
          }
          onClick={handleRowClick}
        />
      );
    },
  },
  {
    id: 'creationDate',
    header: ({ column }) => (
      <SortableHeader<BulletinCategoryResponseDto, unknown>
        titleTranslationId="bulletinboard.creationDate"
        column={column}
      />
    ),
    accessorFn: (row) => row.createdAt,
    cell: ({ row }) => {
      const { setSelectedCategory } = useAppConfigBulletinTableStore();
      const { setUpdateDeleteEntityDialogOpen } = useAppConfigDialogStore();
      const handleRowClick = () => {
        setSelectedCategory(row.original);
        setUpdateDeleteEntityDialogOpen(true);
      };
      return (
        <SelectableTextCell
          onClick={handleRowClick}
          text={formatDate(row.original.createdAt.toString())}
        />
      );
    },
  },
  {
    id: 'visibleForUsers',
    header: ({ column }) => (
      <SortableHeader<BulletinCategoryResponseDto, unknown>
        titleTranslationId="bulletinboard.visibleForUsers"
        column={column}
      />
    ),
    accessorFn: (row) => row.visibleForUsers,
    cell: ({ row }) => {
      const { setSelectedCategory } = useAppConfigBulletinTableStore();
      const { setUpdateDeleteEntityDialogOpen } = useAppConfigDialogStore();
      const handleRowClick = () => {
        setSelectedCategory(row.original);
        setUpdateDeleteEntityDialogOpen(true);
      };
      return (
        <SelectableTextCell
          onClick={handleRowClick}
          text={row.original.visibleForUsers.length.toString()}
        />
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.name || '';
      const b = rowB.original.name || '';
      return a.localeCompare(b);
    },
  },
  {
    id: 'visibleForGroups',
    header: ({ column }) => (
      <SortableHeader<BulletinCategoryResponseDto, unknown>
        titleTranslationId="bulletinboard.visibleForGroups"
        column={column}
      />
    ),
    accessorFn: (row) => row.visibleForGroups,
    cell: ({ row }) => {
      const { setSelectedCategory } = useAppConfigBulletinTableStore();
      const { setUpdateDeleteEntityDialogOpen } = useAppConfigDialogStore();
      const handleRowClick = () => {
        setSelectedCategory(row.original);
        setUpdateDeleteEntityDialogOpen(true);
      };
      return (
        <SelectableTextCell
          onClick={handleRowClick}
          text={row.original.visibleForGroups.length.toString()}
        />
      );
    },
  },
  {
    id: 'editableByUsers',
    header: ({ column }) => (
      <SortableHeader<BulletinCategoryResponseDto, unknown>
        titleTranslationId="bulletinboard.editableByUsers"
        column={column}
      />
    ),
    accessorFn: (row) => row.editableByUsers,
    cell: ({ row }) => {
      const { setSelectedCategory } = useAppConfigBulletinTableStore();
      const { setUpdateDeleteEntityDialogOpen } = useAppConfigDialogStore();
      const handleRowClick = () => {
        setSelectedCategory(row.original);
        setUpdateDeleteEntityDialogOpen(true);
      };
      return (
        <SelectableTextCell
          onClick={handleRowClick}
          text={row.original.editableByUsers.length.toString()}
        />
      );
    },
  },
  {
    id: 'editableByGroups',
    header: ({ column }) => (
      <SortableHeader<BulletinCategoryResponseDto, unknown>
        titleTranslationId="bulletinboard.editableByGroups"
        column={column}
      />
    ),
    accessorFn: (row) => row.editableByGroups,
    cell: ({ row }) => {
      const { setSelectedCategory } = useAppConfigBulletinTableStore();
      const { setUpdateDeleteEntityDialogOpen } = useAppConfigDialogStore();
      const handleRowClick = () => {
        setSelectedCategory(row.original);
        setUpdateDeleteEntityDialogOpen(true);
      };
      return (
        <SelectableTextCell
          onClick={handleRowClick}
          text={row.original.editableByGroups.length.toString()}
        />
      );
    },
  },
];

export default AppConfigBulletinTableColumn;
