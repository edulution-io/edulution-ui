import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { BulletinCategoryDto } from '@libs/bulletinBoard/type/bulletinCategoryDto';

const AppConfigBulletinTableColumn: ColumnDef<BulletinCategoryDto>[] = [
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
      <SortableHeader<BulletinCategoryDto, unknown>
        titleTranslationId="bulletinboard.visibleFor"
        column={column}
      />
    ),
    accessorFn: (row) => row.visibleForGroups,
    cell: ({ row }) => <SelectableTextCell text={row.original.name} />,
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.name || '';
      const b = rowB.original.name || '';
      return a.localeCompare(b);
    },
  },
  {
    id: 'editorialAccess',
    header: ({ column }) => (
      <SortableHeader<BulletinCategoryDto, unknown>
        titleTranslationId="bulletinboard.editorialAccess"
        column={column}
      />
    ),
    accessorFn: (row) => row.editableByGroups,
    cell: ({ row }) => <SelectableTextCell text={row.original.name} />,
  },
];

export default AppConfigBulletinTableColumn;
