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
import MCP_CONFIG_TABLE_COLUMNS from '@libs/mcp/constants/mcpConfigTableColumns';
import type McpConfigDto from '@libs/mcp/types/mcpConfigDto';
import TableActionCell from '@/components/ui/Table/TableActionCell';
import { DeleteIcon, EditIcon } from '@libs/common/constants/standardActionIcons';
import MCP_CONFIG_DIALOG_KEY from '@libs/mcp/constants/mcpConfigDialogKey';
import useMcpConfigTableStore from '@/pages/Settings/components/mcp/hook/useMcpConfigTableStore';
import useAppConfigTableDialogStore from '../../AppConfig/components/table/useAppConfigTableDialogStore';

const McpConfigTableColumns: ColumnDef<McpConfigDto>[] = [
  {
    id: MCP_CONFIG_TABLE_COLUMNS.ID,
    size: 40,
    header: () => <div className="hidden" />,
    meta: {
      translationId: 'common.select',
    },
    cell: ({ row }) => (
      <SelectableTextCell
        row={row}
        className="max-w-0"
      />
    ),
  },
  {
    id: MCP_CONFIG_TABLE_COLUMNS.NAME,
    size: 150,
    header: ({ column }) => <SortableHeader<McpConfigDto, unknown> column={column} />,
    meta: {
      translationId: 'mcpconfig.settings.name',
    },
    accessorFn: (row) => row.name,
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => row.toggleSelected()}
        text={row.original.name}
      />
    ),
  },
  {
    id: MCP_CONFIG_TABLE_COLUMNS.URL,
    size: 250,
    header: ({ column }) => <SortableHeader<McpConfigDto, unknown> column={column} />,
    meta: {
      translationId: 'mcpconfig.settings.serverUrl',
    },
    accessorFn: (row) => row.url,
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => row.toggleSelected()}
        text={row.original.url}
      />
    ),
  },
  {
    id: MCP_CONFIG_TABLE_COLUMNS.ALLOWED_USERS,
    size: 150,
    header: ({ column }) => <SortableHeader<McpConfigDto, unknown> column={column} />,
    meta: {
      translationId: 'mcpconfig.settings.allowedUsers.title',
    },
    accessorFn: (row) => row.allowedUsers?.length || 0,
    cell: ({ row }) => {
      const users = row.original.allowedUsers || [];
      let displayText: string;
      if (users.length === 0) {
        displayText = '-';
      } else if (users.length <= 2) {
        displayText = users.map((u) => u.label || u.username).join(', ');
      } else {
        displayText = `${users
          .slice(0, 2)
          .map((u) => u.label || u.username)
          .join(', ')} +${users.length - 2}`;
      }
      return (
        <SelectableTextCell
          onClick={() => row.toggleSelected()}
          text={displayText}
        />
      );
    },
  },
  {
    id: MCP_CONFIG_TABLE_COLUMNS.ALLOWED_GROUPS,
    size: 150,
    header: ({ column }) => <SortableHeader<McpConfigDto, unknown> column={column} />,
    meta: {
      translationId: 'mcpconfig.settings.allowedGroups.title',
    },
    accessorFn: (row) => row.allowedGroups?.length || 0,
    cell: ({ row }) => {
      const groups = row.original.allowedGroups || [];
      let displayText: string;
      if (groups.length === 0) {
        displayText = '-';
      } else if (groups.length <= 2) {
        displayText = groups.map((g) => g.label).join(', ');
      } else {
        displayText = `${groups
          .slice(0, 2)
          .map((g) => g.label)
          .join(', ')} +${groups.length - 2}`;
      }
      return (
        <SelectableTextCell
          onClick={() => row.toggleSelected()}
          text={displayText}
        />
      );
    },
  },
  {
    id: 'actions',
    size: 80,
    header: ({ column }) => <SortableHeader<McpConfigDto, unknown> column={column} />,
    meta: {
      translationId: 'common.actions',
    },
    cell: ({ row }) => {
      const { setSelectedConfig, deleteTableEntry, fetchTableContent } = useMcpConfigTableStore();
      const { setDialogOpen } = useAppConfigTableDialogStore();

      return (
        <TableActionCell
          actions={[
            {
              icon: EditIcon,
              translationId: 'common.edit',
              onClick: () => {
                setSelectedConfig(row.original);
                setDialogOpen(MCP_CONFIG_DIALOG_KEY);
              },
            },
            {
              icon: DeleteIcon,
              translationId: 'common.delete',
              onClick: async () => {
                if (row.original.id) {
                  await deleteTableEntry('', row.original.id);
                }
                await fetchTableContent();
              },
            },
          ]}
          row={row}
        />
      );
    },
  },
];

export default McpConfigTableColumns;
