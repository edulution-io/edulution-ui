/*
 * Copyright (C) [2025] [Netzint GmbH]
 * ...
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import McpTool from '@libs/mcp/types/mcpTool';
import McpToolCallResult from '@libs/mcp/types/mcpToolCallResult';
import JsonRpcResponse from '@libs/common/types/jsonRpcResponse';
import ToolsListResult from '@libs/mcp/types/toolsListResult';
import mcpMethods from '@libs/mcp/constants/mcpMethods';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';

@Injectable()
class McpService implements OnModuleInit {
  private readonly logger = new Logger(McpService.name);

  private client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const serverUrl = this.configService.get<string>('MCP_SERVER_URL', 'http://localhost:3002');

    this.client = axios.create({
      baseURL: serverUrl,
      headers: {
        [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_JSON,
        Accept: `${RequestResponseContentType.APPLICATION_JSON}, ${RequestResponseContentType.TEXT_EVENT_STREAM}`,
      },
    });

    this.logger.log(`MCP Service initialized: ${serverUrl}`);
  }

  private async sendJsonRpc<T>(method: string, params: Record<string, unknown>, token: string): Promise<T> {
    const { data } = await this.client.post<JsonRpcResponse<T>>(
      '/mcp',
      {
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (data.error) {
      return Promise.reject(data.error);
    }

    if (!data.result) {
      return {} as T;
    }

    return data.result;
  }

  async listTools(token: string): Promise<McpTool[]> {
    try {
      const result = await this.sendJsonRpc<ToolsListResult>(mcpMethods.TOOLS_LIST, {}, token);
      return result.tools;
    } catch (error) {
      return [];
    }
  }

  async callTool(token: string, name: string, args: Record<string, unknown>): Promise<McpToolCallResult> {
    try {
      return await this.sendJsonRpc<McpToolCallResult>(mcpMethods.TOOLS_CALL, { name, arguments: args }, token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{ type: 'text', text: errorMessage }],
        isError: true,
      };
    }
  }
}

export default McpService;
