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
import { persist } from 'zustand/middleware';
import { MCP_ENDPOINT, MCP_TOOLS_ENDPOINT } from '@libs/mcp/constants/mcpEndpoints';
import eduApi from '@/api/eduApi';
import McpToolWithConfig from '@libs/mcp/types/mcpToolWithConfig';

interface UseMcpToolsStore {
  tools: McpToolWithConfig[];
  enabledTools: string[];
  isLoading: boolean;
  error: string | null;
  fetchTools: () => Promise<void>;
  setEnabledTools: (toolNames: string[]) => void;
  toggleTool: (toolName: string) => void;
  enableAllTools: () => void;
  disableAllTools: () => void;
  getToolsByConfig: () => Record<string, McpToolWithConfig[]>;
  getEnabledToolsWithConfig: () => McpToolWithConfig[];
}

const useMcpTools = create<UseMcpToolsStore>()(
  persist(
    (set, get) => ({
      tools: [],
      enabledTools: [],
      isLoading: false,
      error: null,

      fetchTools: async () => {
        if (get().isLoading) return;

        set({ isLoading: true, error: null });

        try {
          const { data } = await eduApi.get<McpToolWithConfig[]>(`${MCP_ENDPOINT}/${MCP_TOOLS_ENDPOINT}`);
          const { enabledTools } = get();

          const validEnabled = enabledTools.filter((name) => data.some((t) => t.name === name));

          set({
            tools: data,
            enabledTools: validEnabled.length > 0 ? validEnabled : data.map((t) => t.name), // Default: all enabled
            isLoading: false,
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tools';
          set({ error: errorMessage, isLoading: false });
        }
      },

      setEnabledTools: (toolNames) => set({ enabledTools: toolNames }),

      toggleTool: (toolName) => {
        const { enabledTools } = get();
        const newEnabled = enabledTools.includes(toolName)
          ? enabledTools.filter((t) => t !== toolName)
          : [...enabledTools, toolName];
        set({ enabledTools: newEnabled });
      },

      enableAllTools: () => {
        const { tools } = get();
        set({ enabledTools: tools.map((t) => t.name) });
      },

      disableAllTools: () => set({ enabledTools: [] }),

      getToolsByConfig: () => {
        const { tools } = get();
        return tools.reduce<Record<string, McpToolWithConfig[]>>((acc, tool) => {
          const key = tool.configName || 'Unknown';
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(tool);
          return acc;
        }, {});
      },

      getEnabledToolsWithConfig: () => {
        const { tools, enabledTools } = get();
        return tools.filter((tool) => enabledTools.includes(tool.name));
      },
    }),
    {
      name: 'edulution-ai-enabled-tools',
      partialize: (state) => ({ enabledTools: state.enabledTools }),
    },
  ),
);

export default useMcpTools;
