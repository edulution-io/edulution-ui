import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { FaEyeSlash } from 'react-icons/fa';
import { IoEyeSharp } from 'react-icons/io5';
import useBulletinCategoryTableStore from '@/pages/Settings/AppConfig/bulletinboard/useBulletinCategoryTableStore';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import SortTableCell from '@/components/ui/Table/SortTableCell';
import DEFAULT_TABLE_SORT_PROPERTY_KEY from '@libs/common/constants/defaultTableSortProperty';
import useAppConfigTableDialogStore from '../components/table/useAppConfigTableDialogStore';

const AppConfigBulletinCategoryTableColumn: ColumnDef<BulletinCategoryResponseDto>[] = [
  {
    id: DEFAULT_TABLE_SORT_PROPERTY_KEY,
    header: ({ column }) => (
      <SortableHeader<BulletinCategoryResponseDto, unknown>
        column={column}
        className="max-w-32"
      />
    ),
    meta: {
      translationId: 'common.sortOrder',
    },
    accessorFn: (row) => row.position,
    cell: ({ row }) => {
      const { setCategoryPosition, fetchTableContent, tableContentData } = useBulletinCategoryTableStore();
      const { id, position } = row.original;
      const moveUp = async () => {
        await setCategoryPosition(id, position - 1);
        await fetchTableContent();
      };
      const moveDown = async () => {
        await setCategoryPosition(id, position + 1);
        await fetchTableContent();
      };

      return (
        <SortTableCell
          moveUp={moveUp}
          moveDown={moveDown}
          lastPosition={tableContentData.length}
          position={position}
        />
      );
    },
  },
  {
    id: 'name',
    header: ({ column }) => <SortableHeader<BulletinCategoryResponseDto, unknown> column={column} />,

    meta: {
      translationId: 'bulletinboard.name',
    },
    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const { setSelectedCategory } = useBulletinCategoryTableStore();
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
      const { setSelectedCategory } = useBulletinCategoryTableStore();
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
      const { setSelectedCategory } = useBulletinCategoryTableStore();
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

export default AppConfigBulletinCategoryTableColumn;
