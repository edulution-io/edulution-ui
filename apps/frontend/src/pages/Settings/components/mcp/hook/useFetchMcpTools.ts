import { useState } from 'react';
import eduApi from '@/api/eduApi';
import { MCP_ENDPOINT } from '@libs/mcp/constants/mcpEndpoints';
import McpTool from '@libs/mcp/types/mcpTool';
import FetchMcpToolsResult from '@libs/chat/types/fetchMcpToolsResult';

const useFetchMcpTools = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tools, setTools] = useState<McpTool[]>([]);

  const fetchTools = async (url: string): Promise<FetchMcpToolsResult> => {
    setIsLoading(true);
    try {
      const response = await eduApi.post<FetchMcpToolsResult>(`${MCP_ENDPOINT}/test-connection`, {
        url,
      });
      if (response.data.success) {
        setTools(response.data.tools);
      } else {
        setTools([]);
      }
      return response.data;
    } catch (err) {
      console.error('Failed to fetch MCP tools:', err);
      setTools([]);
      return { success: false, tools: [] };
    } finally {
      setIsLoading(false);
    }
  };

  const resetTools = () => {
    setTools([]);
  };

  return { fetchTools, tools, isLoading, resetTools };
};

export default useFetchMcpTools;
