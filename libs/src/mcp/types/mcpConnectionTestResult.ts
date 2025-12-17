import McpTool from './mcpTool';

interface McpConnectionTestResult {
  success: boolean;
  toolCount: number;
  tools: McpTool[];
}

export default McpConnectionTestResult;
