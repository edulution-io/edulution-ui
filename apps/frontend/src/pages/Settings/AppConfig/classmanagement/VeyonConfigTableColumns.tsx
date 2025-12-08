/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
