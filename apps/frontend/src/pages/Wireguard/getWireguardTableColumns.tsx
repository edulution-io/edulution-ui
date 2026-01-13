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

type WireguardPeer = {
  name: string;
  public_key: string;
  ip: string;
  routes: string[];
  type: 'client' | 'site';
  allowed_ips?: string[];
  endpoint?: string;
};

type WireguardTableColumnsProps = {
  onPublicKeyClick: (name: string) => void;
};

const getWireguardTableColumns = ({ onPublicKeyClick }: WireguardTableColumnsProps): ColumnDef<WireguardPeer>[] => [
  {
    id: 'name',
    header: ({ column }) => <SortableHeader<WireguardPeer, unknown> column={column} />,
    meta: {
      translationId: 'wireguard.name',
    },
    accessorFn: (row) => row.name,
    cell: ({ row }) => <SelectableCell text={row.original.name} />,
  },
  {
    id: 'type',
    header: ({ column }) => <SortableHeader<WireguardPeer, unknown> column={column} />,
    meta: {
      translationId: 'wireguard.type',
    },
    accessorFn: (row) => row.type,
    cell: ({ row }) => (
      <SelectableCell
        text={
          <BadgeSH variant={row.original.type === 'site' ? 'default' : 'secondary'}>
            {row.original.type === 'site' ? 'Site-to-Site' : 'Client'}
          </BadgeSH>
        }
      />
    ),
  },
  {
    id: 'ip',
    header: ({ column }) => <SortableHeader<WireguardPeer, unknown> column={column} />,
    meta: {
      translationId: 'wireguard.ip',
    },
    accessorFn: (row) => row.ip,
    cell: ({ row }) => <SelectableCell text={row.original.ip} />,
  },
  {
    id: 'public_key',
    header: ({ column }) => <SortableHeader<WireguardPeer, unknown> column={column} />,
    meta: {
      translationId: 'wireguard.publicKey',
    },
    accessorFn: (row) => row.public_key,
    cell: ({ row }) => (
      <SelectableCell
        onClick={() => onPublicKeyClick(row.original.name)}
        text={`${row.original.public_key.substring(0, 20)}...`}
        className="cursor-pointer text-primary hover:underline"
      />
    ),
  },
  {
    id: 'routes',
    header: ({ column }) => <SortableHeader<WireguardPeer, unknown> column={column} />,
    meta: {
      translationId: 'wireguard.routes',
    },
    accessorFn: (row) => row.routes.join(', '),
    cell: ({ row }) => <SelectableCell text={row.original.routes.join(', ')} />,
  },
  {
    id: 'allowed_ips',
    header: ({ column }) => <SortableHeader<WireguardPeer, unknown> column={column} />,
    meta: {
      translationId: 'wireguard.allowedIps',
    },
    accessorFn: (row) => row.allowed_ips?.join(', ') || '-',
    cell: ({ row }) => <SelectableCell text={row.original.allowed_ips?.join(', ') || '-'} />,
  },
];

export default getWireguardTableColumns;
