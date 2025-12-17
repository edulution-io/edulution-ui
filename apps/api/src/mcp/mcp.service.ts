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

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import McpTool from '@libs/mcp/types/mcpTool';
import McpToolCallResult from '@libs/mcp/types/mcpToolCallResult';
import JsonRpcResponse from '@libs/common/types/jsonRpcResponse';
import ToolsListResult from '@libs/mcp/types/toolsListResult';
import FetchMcpToolsResult from '@libs/mcp/types/fetchMcpToolsResult';
import mcpMethods from '@libs/mcp/constants/mcpMethods';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';

@Injectable()
class McpService {
  private readonly logger = new Logger(McpService.name);

  private getHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_JSON,
      Accept: `${RequestResponseContentType.APPLICATION_JSON}, ${RequestResponseContentType.TEXT_EVENT_STREAM}`,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async sendJsonRpc<T>(
    url: string,
    method: string,
    params: Record<string, unknown>,
    token?: string,
  ): Promise<T> {
    const { data } = await axios.post<JsonRpcResponse<T>>(
      url,
      {
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      },
      {
        headers: this.getHeaders(token),
        timeout: 10000,
      },
    );

    if (data.error) {
      throw new Error(data.error.message || 'JSON-RPC error');
    }

    if (!data.result) {
      return {} as T;
    }

    return data.result;
  }

  async listTools(url: string, token?: string): Promise<McpTool[]> {
    try {
      const result = await this.sendJsonRpc<ToolsListResult>(url, mcpMethods.TOOLS_LIST, {}, token);
      return result.tools || [];
    } catch (error) {
      this.logger.error('Failed to list tools:', error);
      return [];
    }
  }

  async callTool(url: string, name: string, args: Record<string, unknown>, token?: string): Promise<McpToolCallResult> {
    try {
      return await this.sendJsonRpc<McpToolCallResult>(url, mcpMethods.TOOLS_CALL, { name, arguments: args }, token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{ type: 'text', text: errorMessage }],
        isError: true,
      };
    }
  }

  async testConnection(url: string, token?: string): Promise<FetchMcpToolsResult> {
    if (!url) {
      return { success: false, tools: [] };
    }

    try {
      const tools = await this.listTools(url, token);
      return { success: true, tools };
    } catch (error) {
      this.logger.error('Failed to test MCP connection:', error);
      return { success: false, tools: [] };
    }
  }
}

export default McpService;
