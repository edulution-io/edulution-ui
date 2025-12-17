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
