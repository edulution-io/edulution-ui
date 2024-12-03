import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { IoEyeSharp } from 'react-icons/io5';
import { FaEyeSlash } from 'react-icons/fa';
import formatDate from '@libs/common/utils/formatDate';
import useAppConfigBulletinTable from '@/pages/Settings/AppConfig/components/table/useAppConfigBulletinTable';
import { ButtonSH } from '@/components/ui/ButtonSH';
import { MdDriveFileRenameOutline, MdOutlineDeleteOutline } from 'react-icons/md';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/type/bulletinCategoryResponseDto';

export interface AppConfigBulletinTableColumnProps {
  onDelete: (category: BulletinCategoryResponseDto) => void;
  onModify: (category: BulletinCategoryResponseDto) => void;
}

const AppConfigBulletinTableColumn = ({
  onDelete,
  onModify,
}: AppConfigBulletinTableColumnProps): ColumnDef<BulletinCategoryResponseDto>[] => [
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
      const { setSelectedCategory } = useAppConfigBulletinTable();
      return (
        <SelectableTextCell
          onClick={() => setSelectedCategory(row.original)}
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
    cell: ({ row }) => (
      <SelectableTextCell
        icon={
          row.original.isActive ? <IoEyeSharp className="text-green-500" /> : <FaEyeSlash className="text-red-500" />
        }
      />
    ),
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
    cell: ({ row }) => <SelectableTextCell text={formatDate(row.original.createdAt.toString())} />,
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
    cell: ({ row }) => <SelectableTextCell text={row.original.visibleForUsers.length.toString()} />,
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
    cell: ({ row }) => <SelectableTextCell text={row.original.visibleForGroups.length.toString()} />,
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
    cell: ({ row }) => <SelectableTextCell text={row.original.editableByUsers.length.toString()} />,
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
    cell: ({ row }) => <SelectableTextCell text={row.original.editableByGroups.length.toString()} />,
  },
  {
    id: 'bulletinboard-action-button',
    header: ({ column }) => (
      <SortableHeader<BulletinCategoryResponseDto, unknown>
        titleTranslationId="bulletinboard.action"
        column={column}
      />
    ),
    accessorFn: (row) => row,
    cell: ({ row }) => {
      const { setSelectedCategory } = useAppConfigBulletinTable();

      return (
        <div className="flex gap-2">
          <ButtonSH
            onClick={() => {
              onDelete(row.original);
              console.log('Rename clicked for:', row.original);
              setSelectedCategory(row.original);
            }}
          >
            <MdDriveFileRenameOutline />
          </ButtonSH>
          <ButtonSH
            onClick={() => {
              onModify(row.original);
              console.log('Delete clicked for:', row.original);
              setSelectedCategory(row.original);
            }}
          >
            <MdOutlineDeleteOutline />
          </ButtonSH>
        </div>
      );
    },
  },
];

export default AppConfigBulletinTableColumn;
