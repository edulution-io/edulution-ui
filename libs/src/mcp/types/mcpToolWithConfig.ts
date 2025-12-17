import McpTool from './mcpTool';

interface McpToolWithConfig extends McpTool {
  configId: string;
  configName: string;
}

export default McpToolWithConfig;
