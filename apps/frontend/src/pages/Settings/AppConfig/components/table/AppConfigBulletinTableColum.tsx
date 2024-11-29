import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { BulletinBoardConfigurationDto } from '@libs/bulletinBoard/type/BulletinBoardConfigurationDto';

const AppConfigBulletinTableColumn: ColumnDef<BulletinBoardConfigurationDto>[] = [
  {
    id: 'name',
    header: ({ column, table }) => (
      <SortableHeader<BulletinBoardConfigurationDto, unknown>
        titleTranslationId="bulletinboard.name"
        column={column}
        table={table}
      />
    ),
    accessorFn: (row) => row.name,
    cell: ({ row }) => (
      <SelectableTextCell
        text={row.original.name}
        isFirstColumn
      />
    ),
  },
  {
    id: 'visibleFor',
    header: ({ column }) => (
      <SortableHeader<BulletinBoardConfigurationDto, unknown>
        titleTranslationId="bulletinboard.visibleFor"
        column={column}
      />
    ),
    accessorFn: (row) => row.visibleFor,
    cell: ({ row }) => <SelectableTextCell text={row.original.visibleFor} />,
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.visibleFor || '';
      const b = rowB.original.visibleFor || '';
      return a.localeCompare(b);
    },
  },
  {
    id: 'editorialAccess',
    header: ({ column }) => (
      <SortableHeader<BulletinBoardConfigurationDto, unknown>
        titleTranslationId="bulletinboard.editorialAccess"
        column={column}
      />
    ),
    accessorFn: (row) => row.editorialAccess,
    cell: ({ row }) => <SelectableTextCell text={row.original.editorialAccess} />,
  },
];

export default AppConfigBulletinTableColumn;
