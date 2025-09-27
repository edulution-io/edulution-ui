/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

declare module '@modelcontextprotocol/sdk/server/mcp.js' {
  export interface McpServerOptions {
    name: string;
    version: string;
    capabilities: {
      resources: Record<string, unknown>;
      tools: Record<string, unknown>;
      prompts: Record<string, unknown>;
    };
  }

  export interface McpServer {
    connect(transport: import('@modelcontextprotocol/sdk/server/stdio.js').StdioServerTransport): Promise<void>;
  }

  export const McpServer: new (options: McpServerOptions) => McpServer;
}

declare module '@modelcontextprotocol/sdk/server/stdio.js' {
  export interface StdioServerTransport {}
  export const StdioServerTransport: new () => StdioServerTransport;
}
