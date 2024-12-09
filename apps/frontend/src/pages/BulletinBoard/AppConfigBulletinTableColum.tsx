import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { IoEyeSharp } from 'react-icons/io5';
import { FaEyeSlash } from 'react-icons/fa';
import useAppConfigBulletinTableStore from '@/pages/BulletinBoard/useAppConfigBulletinTableStore';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import useAppConfigDialogStore from '../Settings/AppConfig/components/table/appConfigDialogStore';

const AppConfigBulletinTableColumn: ColumnDef<BulletinCategoryResponseDto>[] = [
  {
    id: 'name',
    header: ({ column }) => (
      <SortableHeader<BulletinCategoryResponseDto, unknown>
        titleTranslationId="bulletinboard.name"
        column={column}
      />
    ),

    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const { setSelectedCategory } = useAppConfigBulletinTableStore();
      const { setDialogOpen } = useAppConfigDialogStore();
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
    header: ({ column }) => (
      <SortableHeader<BulletinCategoryResponseDto, unknown>
        titleTranslationId="bulletinboard.isActive"
        column={column}
      />
    ),
    accessorFn: (row) => row.isActive,
    cell: ({ row }) => {
      const { setSelectedCategory } = useAppConfigBulletinTableStore();
      const { setDialogOpen } = useAppConfigDialogStore();
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
    header: ({ column }) => (
      <SortableHeader<BulletinCategoryResponseDto, unknown>
        titleTranslationId="common.createdAt"
        column={column}
      />
    ),
    accessorFn: (row) => row.createdAt,
    cell: ({ row }) => {
      const { setSelectedCategory } = useAppConfigBulletinTableStore();
      const { setDialogOpen } = useAppConfigDialogStore();
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
