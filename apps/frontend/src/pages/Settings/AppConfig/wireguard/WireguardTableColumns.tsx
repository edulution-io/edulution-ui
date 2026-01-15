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
import SelectableCell from '@/components/ui/Table/SelectableCell';
import { BadgeSH } from '@/components/ui/BadgeSH';
import Checkbox from '@/components/ui/Checkbox';
import { type WireguardPeer } from '@libs/wireguard/types/wireguard';
import WIREGUARD_TABLE_COLUMNS from '@libs/wireguard/constants/wireguardTableColumns';

const WireguardTableColumns: ColumnDef<WireguardPeer>[] = [
  {
    id: WIREGUARD_TABLE_COLUMNS.SELECT,
    size: 50,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  },
  {
    id: WIREGUARD_TABLE_COLUMNS.NAME,
    header: ({ column }) => <SortableHeader<WireguardPeer, unknown> column={column} />,
    meta: {
      translationId: 'wireguard.name',
    },
    accessorFn: (row) => row.name,
    cell: ({ row }) => (
      <SelectableCell
        text={row.original.name}
        onClick={() => row.toggleSelected()}
      />
    ),
  },
  {
    id: WIREGUARD_TABLE_COLUMNS.STATUS,
    header: ({ column }) => <SortableHeader<WireguardPeer, unknown> column={column} />,
    meta: {
      translationId: 'wireguard.status',
    },
    accessorFn: (row) => row.status,
    cell: ({ row }) => (
      <SelectableCell
        text={
          <BadgeSH variant={row.original.status === 'connected' ? 'default' : 'secondary'}>
            {row.original.status === 'connected' ? 'Connected' : 'Disconnected'}
          </BadgeSH>
        }
        onClick={() => row.toggleSelected()}
      />
    ),
  },
  {
    id: WIREGUARD_TABLE_COLUMNS.ALLOWED_IPS,
    header: ({ column }) => <SortableHeader<WireguardPeer, unknown> column={column} />,
    meta: {
      translationId: 'wireguard.allowedIps',
    },
    accessorFn: (row) => row.allowed_ips,
    cell: ({ row }) => (
      <SelectableCell
        text={row.original.allowed_ips || '-'}
        onClick={() => row.toggleSelected()}
      />
    ),
  },
  {
    id: WIREGUARD_TABLE_COLUMNS.ENDPOINT,
    header: ({ column }) => <SortableHeader<WireguardPeer, unknown> column={column} />,
    meta: {
      translationId: 'wireguard.endpoint',
    },
    accessorFn: (row) => row.endpoint || '-',
    cell: ({ row }) => (
      <SelectableCell
        text={row.original.endpoint || '-'}
        onClick={() => row.toggleSelected()}
      />
    ),
  },
  {
    id: WIREGUARD_TABLE_COLUMNS.LAST_HANDSHAKE,
    header: ({ column }) => <SortableHeader<WireguardPeer, unknown> column={column} />,
    meta: {
      translationId: 'wireguard.lastHandshake',
    },
    accessorFn: (row) => row.last_handshake || '-',
    cell: ({ row }) => (
      <SelectableCell
        text={row.original.last_handshake || '-'}
        onClick={() => row.toggleSelected()}
      />
    ),
  },
];

export default WireguardTableColumns;
