import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';
import useAppConfigTableDialogStore from '../components/table/useAppConfigTableDialogStore';
import useVeyonConfigTableStore from './useVeyonTableStore';

const VeyonConfigTableColumns: ColumnDef<VeyonProxyItem>[] = [
  {
    id: 'id',
    header: ({ column }) => <SortableHeader<VeyonProxyItem, unknown> column={column} />,

    meta: {
      translationId: 'classmanagement.veyonConfigTable.id',
    },
    cell: ({ row }) => {
      const { setDialogOpen } = useAppConfigTableDialogStore();
      const { setSelectedConfig } = useVeyonConfigTableStore();

      const handleRowClick = () => {
        setSelectedConfig(row.original);
        setDialogOpen(true);
      };

      return (
        <SelectableTextCell
          onClick={handleRowClick}
          text={row.id}
        />
      );
    },
  },
  {
    id: 'subnet',
    header: ({ column }) => <SortableHeader<VeyonProxyItem, unknown> column={column} />,

    meta: {
      translationId: 'classmanagement.veyonConfigTable.subnet',
    },
    accessorFn: (row) => row.subnet,
    cell: ({ row }) => {
      const { setDialogOpen } = useAppConfigTableDialogStore();
      const { setSelectedConfig } = useVeyonConfigTableStore();
      const handleRowClick = () => {
        setSelectedConfig(row.original);
        setDialogOpen(true);
      };

      return (
        <SelectableTextCell
          onClick={handleRowClick}
          text={row.original.subnet}
        />
      );
    },
  },
  {
    id: 'proxyAdress',
    header: ({ column }) => <SortableHeader<VeyonProxyItem, unknown> column={column} />,
    meta: {
      translationId: 'classmanagement.veyonConfigTable.proxyAdress',
    },
    accessorFn: (row) => row.proxyAdress,
    cell: ({ row }) => {
      const { setDialogOpen } = useAppConfigTableDialogStore();
      const { setSelectedConfig } = useVeyonConfigTableStore();
      const handleRowClick = () => {
        setSelectedConfig(row.original);
        setDialogOpen(true);
      };
      return (
        <SelectableTextCell
          onClick={handleRowClick}
          text={row.original.proxyAdress}
        />
      );
    },
  },
];

export default VeyonConfigTableColumns;
