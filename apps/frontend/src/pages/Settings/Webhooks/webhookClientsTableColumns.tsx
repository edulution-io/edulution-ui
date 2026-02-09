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
import type WebhookClientDto from '@libs/webhook/types/webhookClientDto';
import WEBHOOK_CLIENTS_TABLE_COLUMNS from '@libs/webhook/constants/webhookClientsTableColumns';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableCell from '@/components/ui/Table/SelectableCell';

const webhookClientsTableColumns: ColumnDef<WebhookClientDto>[] = [
  {
    id: WEBHOOK_CLIENTS_TABLE_COLUMNS.SELECT,
    size: 60,
    header: ({ table, column }) => (
      <SortableHeader<WebhookClientDto, unknown>
        table={table}
        column={column}
        hidden
      />
    ),
    meta: {
      translationId: 'settings.webhooks.select',
    },
    cell: ({ row }) => <SelectableCell row={row} />,
  },
  {
    id: WEBHOOK_CLIENTS_TABLE_COLUMNS.USER_AGENT,
    header: ({ column }) => <SortableHeader<WebhookClientDto, unknown> column={column} />,
    meta: {
      translationId: 'settings.webhooks.userAgent',
    },
    accessorKey: 'userAgent',
    cell: ({ row }) => <SelectableCell text={row.original.userAgent} />,
  },
  {
    id: WEBHOOK_CLIENTS_TABLE_COLUMNS.API_KEY,
    header: ({ column }) => <SortableHeader<WebhookClientDto, unknown> column={column} />,
    meta: {
      translationId: 'settings.webhooks.apiKey',
    },
    accessorKey: 'apiKey',
    cell: ({ row }) => <SelectableCell text={row.original.apiKey} />,
  },
  {
    id: WEBHOOK_CLIENTS_TABLE_COLUMNS.CREATED_AT,
    header: ({ column }) => <SortableHeader<WebhookClientDto, unknown> column={column} />,
    meta: {
      translationId: 'settings.webhooks.createdAt',
    },
    accessorKey: 'createdAt',
    cell: ({ row }) => {
      const date = row.original.createdAt ? new Date(row.original.createdAt).toLocaleString() : '';
      return <SelectableCell text={date} />;
    },
  },
];

export default webhookClientsTableColumns;
