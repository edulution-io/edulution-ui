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

import { create } from 'zustand';
import { RowSelectionState } from '@tanstack/react-table';
import type McpConfigDto from '@libs/mcp/types/mcpConfigDto';
import eduApi from '@/api/eduApi';

const MCP_CONFIG_ENDPOINT = 'mcp/config';

interface McpConfigTableStore {
  tableContentData: McpConfigDto[];
  selectedRows: RowSelectionState;
  selectedConfig: McpConfigDto | null;
  isLoading: boolean;

  fetchTableContent: () => Promise<void>;
  setSelectedRows: (rows: RowSelectionState) => void;
  setSelectedConfig: (config: McpConfigDto | null) => void;
  addOrUpdateConfig: (config: McpConfigDto) => Promise<void>;
  deleteTableEntry: (path: string, id: string) => Promise<void>;
}

const useMcpConfigTableStore = create<McpConfigTableStore>((set, get) => ({
  tableContentData: [],
  selectedRows: {},
  selectedConfig: null,
  isLoading: false,

  fetchTableContent: async () => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<McpConfigDto[]>(MCP_CONFIG_ENDPOINT);
      set({ tableContentData: response.data });
    } catch (error) {
      console.error('Failed to fetch MCP configs:', error);
      set({ tableContentData: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedRows: (rows) => set({ selectedRows: rows }),

  setSelectedConfig: (config) => set({ selectedConfig: config }),

  addOrUpdateConfig: async (config) => {
    try {
      if (config.id && config.id.length > 0) {
        await eduApi.put(`${MCP_CONFIG_ENDPOINT}/${config.id}`, config);
      } else {
        await eduApi.post(MCP_CONFIG_ENDPOINT, config);
      }
      await get().fetchTableContent();
    } catch (error) {
      console.error('Failed to save MCP config:', error);
    }
  },

  deleteTableEntry: async (_path, id) => {
    try {
      await eduApi.delete(`${MCP_CONFIG_ENDPOINT}/${id}`);
      await get().fetchTableContent();
    } catch (error) {
      console.error('Failed to delete MCP config:', error);
    }
  },
}));

export default useMcpConfigTableStore;
