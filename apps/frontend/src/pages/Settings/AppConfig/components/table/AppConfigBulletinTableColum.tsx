import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { BulletinCategoryDto } from '@libs/bulletinBoard/type/bulletinCategoryDto';
import { IoEyeSharp } from 'react-icons/io5';
import { FaEyeSlash } from 'react-icons/fa';
import formatDate from '@libs/common/utils/formatDate';
import useAppConfigBulletinTable from '@/pages/Settings/AppConfig/components/table/useAppConfigBulletinTable';
import { ButtonSH } from '@/components/ui/ButtonSH';
import { MdDriveFileRenameOutline, MdOutlineDeleteOutline } from 'react-icons/md';

interface AppConfigBulletinTableColumnProps {
  onDelete: (category: BulletinCategoryDto) => void;
  onModify: (category: BulletinCategoryDto) => void;
}

const AppConfigBulletinTableColumn = ({
  onDelete,
  onModify,
}: AppConfigBulletinTableColumnProps): ColumnDef<BulletinCategoryDto>[] => [
  {
    id: 'name',
    header: ({ column, table }) => (
      <SortableHeader<BulletinCategoryDto, unknown>
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
      <SortableHeader<BulletinCategoryDto, unknown>
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
      <SortableHeader<BulletinCategoryDto, unknown>
        titleTranslationId="bulletinboard.creationDate"
        column={column}
      />
    ),
    accessorFn: (row) => row.creationDate,
    cell: ({ row }) => <SelectableTextCell text={formatDate(row.original.creationDate.toString())} />,
  },
  {
    id: 'visibleForUsers',
    header: ({ column }) => (
      <SortableHeader<BulletinCategoryDto, unknown>
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
      <SortableHeader<BulletinCategoryDto, unknown>
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
      <SortableHeader<BulletinCategoryDto, unknown>
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
      <SortableHeader<BulletinCategoryDto, unknown>
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
      <SortableHeader<BulletinCategoryDto, unknown>
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
            }}
          >
            <MdDriveFileRenameOutline />
          </ButtonSH>
          <ButtonSH
            onClick={() => {
              onModify(row.original);
              console.log('Delete clicked for:', row.original);
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
