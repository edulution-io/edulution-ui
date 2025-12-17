import McpTool from '@libs/mcp/types/mcpTool';

interface FetchMcpToolsResult {
  success: boolean;
  tools: McpTool[];
  message?: string;
}

export default FetchMcpToolsResult;
