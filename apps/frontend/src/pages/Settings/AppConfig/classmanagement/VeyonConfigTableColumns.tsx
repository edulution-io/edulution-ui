/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import VEYON_PROXY_TABLE_COLUMNS from '@libs/classManagement/constants/veyonProxyTableColumns';
import useAppConfigTableDialogStore from '../components/table/useAppConfigTableDialogStore';
import useVeyonConfigTableStore from './useVeyonConfigTableStore';

const VeyonConfigTableColumns: ColumnDef<VeyonProxyItem>[] = [
  {
    id: VEYON_PROXY_TABLE_COLUMNS.ID,
    size: 60,
    header: ({ column }) => <SortableHeader<VeyonProxyItem, unknown> column={column} />,

    meta: {
      translationId: 'classmanagement.veyonConfigTable.id',
    },
    cell: ({ row }) => {
      const { setDialogOpen } = useAppConfigTableDialogStore();
      const { setSelectedConfig } = useVeyonConfigTableStore();

      const handleRowClick = () => {
        setSelectedConfig(row.original);
        setDialogOpen(ExtendedOptionKeys.VEYON_PROXYS);
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
    id: VEYON_PROXY_TABLE_COLUMNS.SUBNET,
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
        setDialogOpen(ExtendedOptionKeys.VEYON_PROXYS);
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
    id: VEYON_PROXY_TABLE_COLUMNS.PROXY_ADDRESS,
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
        setDialogOpen(ExtendedOptionKeys.VEYON_PROXYS);
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
