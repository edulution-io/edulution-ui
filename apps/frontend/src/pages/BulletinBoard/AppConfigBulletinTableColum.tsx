import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { IoEyeSharp } from 'react-icons/io5';
import { FaEyeSlash } from 'react-icons/fa';
import useAppConfigBulletinTableStore from '@/pages/BulletinBoard/useAppConfigBulletinTableStore';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import useAppConfigTableDialogStore from '../Settings/AppConfig/components/table/useAppConfigTableDialogStore';

const AppConfigBulletinTableColumn: ColumnDef<BulletinCategoryResponseDto>[] = [
  {
    id: 'name',
    header: ({ column }) => <SortableHeader<BulletinCategoryResponseDto, unknown> column={column} />,

    meta: {
      translationId: 'bulletinboard.name',
    },
    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const { setSelectedCategory } = useAppConfigBulletinTableStore();
      const { setDialogOpen } = useAppConfigTableDialogStore();
      const handleRowClick = () => {
        setSelectedCategory(row.original);
        setDialogOpen(true);
      };

      return (
        <SelectableTextCell
          onClick={handleRowClick}
          text={row.original.name}
        />
      );
    },
  },
  {
    id: 'isActive',
    header: ({ column }) => <SortableHeader<BulletinCategoryResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'bulletinboard.isActive',
    },
    accessorFn: (row) => row.isActive,
    cell: ({ row }) => {
      const { setSelectedCategory } = useAppConfigBulletinTableStore();
      const { setDialogOpen } = useAppConfigTableDialogStore();
      const handleRowClick = () => {
        setSelectedCategory(row.original);
        setDialogOpen(true);
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
    id: 'createdAt',
    header: ({ column }) => <SortableHeader<BulletinCategoryResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'common.createdAt',
    },
    accessorFn: (row) => row.createdAt,
    cell: ({ row }) => {
      const { setSelectedCategory } = useAppConfigBulletinTableStore();
      const { setDialogOpen } = useAppConfigTableDialogStore();
      const handleRowClick = () => {
        setSelectedCategory(row.original);
        setDialogOpen(true);
      };
      return (
        <SelectableTextCell
          onClick={handleRowClick}
          text={new Date(row.original.createdAt).toLocaleDateString()}
        />
      );
    },
  },
];

export default AppConfigBulletinTableColumn;
