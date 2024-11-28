import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { BulletinBoardConfigurationDTO } from '@libs/bulletinBoard/type/BulletinBoardConfigurationDTO';

const AppConfigBulletinTableColumn: ColumnDef<BulletinBoardConfigurationDTO>[] = [
  {
    id: 'name',
    header: ({ column, table }) => (
      <SortableHeader<BulletinBoardConfigurationDTO, unknown>
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
      <SortableHeader<BulletinBoardConfigurationDTO, unknown>
        titleTranslationId="bulletinboard.visibleFor"
        column={column}
      />
    ),
    accessorFn: (row) => row.visibleFor,
    cell: ({ row }) => <SelectableTextCell text={row.original.visibleFor} />,
  },
  {
    id: 'editorialAccess',
    header: ({ column }) => (
      <SortableHeader<BulletinBoardConfigurationDTO, unknown>
        titleTranslationId="bulletinboard.editorialAccess"
        column={column}
      />
    ),
    accessorFn: (row) => row.editorialAccess,
    cell: ({ row }) => <SelectableTextCell text={row.original.editorialAccess} />,
  },
];

export default AppConfigBulletinTableColumn;
