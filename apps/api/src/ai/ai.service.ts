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
import { dynamicTool, jsonSchema, LanguageModel, ModelMessage, stepCountIs, streamText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import AIChatMessage from '@libs/ai/types/aiChatMessage';
import McpTool from '@libs/mcp/types/mcpTool';
import AiConfigDto from '@libs/ai/types/aiConfigDto';
import AIProvider from '@libs/ai/constants/aiProvider';
import AIChatMessagePart from '@libs/ai/types/aiChatMessagePart';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import McpService from '../mcp/mcp.service';
import AiConfigService from './ai.config.service';
import McpConfigService from '../mcp/mcpConfigService';

interface McpToolWithUrl extends McpTool {
  mcpUrl: string;
}

@Injectable()
class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private mcpService: McpService,
    private aiConfigService: AiConfigService,
    private mcpConfigService: McpConfigService,
  ) {}

  private normalizeBaseUrl(url: string): string {
    let baseUrl = url.replace(/\/+$/, '');
    if (!baseUrl.endsWith('/v1')) {
      baseUrl = `${baseUrl}/v1`;
    }
    return baseUrl;
  }

  private createModel(config: AiConfigDto): LanguageModel {
    const { apiStandard, aiModel, apiKey, url } = config;

    switch (apiStandard) {
      case AIProvider.ANTHROPIC: {
        const anthropic = createAnthropic({
          apiKey,
          baseURL: url ? this.normalizeBaseUrl(url) : undefined,
        });
        return anthropic(aiModel);
      }

      case AIProvider.OPENAI: {
        const openai = createOpenAI({
          apiKey,
          baseURL: url ? this.normalizeBaseUrl(url) : undefined,
        });
        return openai(aiModel);
      }

      case AIProvider.GOOGLE: {
        const google = createGoogleGenerativeAI({
          apiKey,
          baseURL: url ? this.normalizeBaseUrl(url) : undefined,
        });
        return google(aiModel);
      }

      case AIProvider.OPENAI_COMPATIBLE: {
        const baseURL = this.normalizeBaseUrl(url || '');
        const compatible = createOpenAICompatible({
          name: 'openai-compatible',
          baseURL,
          apiKey: apiKey || 'not-needed',
        });
        return compatible.chatModel(aiModel);
      }

      default:
        throw new Error(`Unknown API standard: ${String(apiStandard)}`);
    }
  }

  private extractContent(msg: AIChatMessage): string {
    if (typeof msg.content === 'string' && msg.content.length > 0) {
      return msg.content;
    }
    if (Array.isArray(msg.parts)) {
      const textParts = msg.parts.filter(
        (p): p is AIChatMessagePart & { text: string } => p.type === 'text' && typeof p.text === 'string',
      );
      return textParts.map((p) => p.text).join('');
    }
    return '';
  }

  private createMcpTool(mcpTool: McpToolWithUrl, token: string) {
    return dynamicTool({
      description: mcpTool.description,
      inputSchema: jsonSchema(mcpTool.inputSchema),
      execute: async (args) => {
        this.logger.log(`[TOOL CALL] ${mcpTool.name}`);
        this.logger.log(`[TOOL ARGS] ${JSON.stringify(args)}`);

        const result = await this.mcpService.callTool(
          mcpTool.mcpUrl,
          mcpTool.name,
          args as Record<string, unknown>,
          token,
        );

        const textContent = result.content.find((c) => c.type === 'text');
        const resultText = textContent?.text || JSON.stringify(result.content);

        this.logger.log(`[TOOL RESULT] isError=${result.isError ?? false}`);
        this.logger.log(`[TOOL RESULT] ${resultText.substring(0, 500)}`);

        if (result.isError) {
          return `ERROR: ${resultText}`;
        }

        return resultText;
      },
    });
  }

  async streamChatWithTools(
    configId: string,
    messages: AIChatMessage[],
    enabledTools: string[],
    token: string,
    user: JwtUser,
  ) {
    this.logger.log('=== AI CHAT START ===');
    this.logger.log(`[AI] User: ${user.preferred_username}`);
    this.logger.log(`[AI] Messages: ${messages.length}`);
    this.logger.log(`[AI] Enabled tools: ${enabledTools.join(', ')}`);

    const config = await this.aiConfigService.getById(configId);
    if (!config) {
      throw new Error(`AI Config not found: ${configId}`);
    }

    this.logger.log(`[AI] Config: ${config.name} (${config.apiStandard}/${config.aiModel})`);

    const model = this.createModel(config);

    const mcpConfigs = await this.mcpConfigService.getByUserAccess(user.preferred_username, user.ldapGroups);
    this.logger.log(`Found ${mcpConfigs.length} MCP configs for user ${user.preferred_username}`);

    const toolResults = await Promise.all(
      mcpConfigs.map(async (mcpConfig) => {
        try {
          const tools = await this.mcpService.listTools(mcpConfig.url, token);
          this.logger.log(`Found ${tools.length} tools from MCP config: ${mcpConfig.name} (${mcpConfig.url})`);
          return tools.map((tool) => ({ ...tool, mcpUrl: mcpConfig.url }));
        } catch (error) {
          this.logger.error(`Failed to list tools from ${mcpConfig.name}: ${error}`);
          return [];
        }
      }),
    );
    const allToolsWithUrl: McpToolWithUrl[] = toolResults.flat();

    const filteredTools = allToolsWithUrl.filter((t) => enabledTools.includes(t.name));
    this.logger.log(`Enabled tools: ${filteredTools.map((t) => t.name).join(', ')}`);

    const modelMessages: ModelMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: this.extractContent(msg),
    }));

    if (filteredTools.length === 0) {
      return streamText({
        model,
        messages: modelMessages,
      });
    }

    const tools = Object.fromEntries(
      filteredTools.map((mcpTool) => [mcpTool.name, this.createMcpTool(mcpTool, token)]),
    );

    this.logger.log(`[AI] Starting streamText with ${Object.keys(tools).length} tools`);

    return streamText({
      model,
      messages: modelMessages,
      tools,
      toolChoice: 'auto',
      stopWhen: stepCountIs(10),
      onStepFinish: (step) => {
        this.logger.log(`[AI STEP] finishReason=${step.finishReason}`);
        if (step.toolCalls?.length) {
          this.logger.log(`[AI STEP] toolCalls: ${step.toolCalls.map((t) => t.toolName).join(', ')}`);
        }
        if (step.toolResults?.length) {
          this.logger.log(`[AI STEP] toolResults: ${step.toolResults.length} results`);
          step.toolResults.forEach((r: { toolName: string }, i: number) => {
            this.logger.log(`[AI STEP] result[${i}]: ${r.toolName}`);
          });
        }
        if (step.text) {
          this.logger.log(`[AI STEP] text: ${step.text.substring(0, 200)}`);
        }
      },
    });
  }
}

export default AIService;
