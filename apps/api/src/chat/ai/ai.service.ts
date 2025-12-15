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

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { dynamicTool, jsonSchema, LanguageModel, ModelMessage, stepCountIs, streamText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import AIChatMessage from '@libs/chat/types/aiChatMessage';
import { AIProviderType } from '@libs/chat/types/AIProviderType';
import AIProvider from '@libs/chat/constants/aiProvider';
import McpTool from '@libs/mcp/types/mcpTool';
import McpService from '../../mcp/mcp.service';

interface UIMessagePart {
  type: string;
  text?: string;
}

interface UIMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content?: string;
  parts?: UIMessagePart[];
}

type IncomingMessage = AIChatMessage | UIMessage;

@Injectable()
class AIService implements OnModuleInit {
  private readonly logger = new Logger(AIService.name);

  private model: LanguageModel;

  private provider: AIProviderType;

  private modelName: string;

  constructor(
    private configService: ConfigService,
    private mcpService: McpService,
  ) {}

  onModuleInit() {
    this.provider = this.configService.get<AIProviderType>('AI_PROVIDER', AIProvider.ANTHROPIC);
    this.modelName = this.configService.get<string>('AI_MODEL', 'claude-sonnet-4-20250514');

    try {
      this.model = this.createModel(this.provider, this.modelName);
      this.logger.log(`AI Service initialized: ${this.provider} / ${this.modelName}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to initialize AI Service: ${errorMessage}`);
      throw error;
    }
  }

  private createModel(provider: AIProviderType, model: string): LanguageModel {
    switch (provider) {
      case AIProvider.ANTHROPIC: {
        const anthropic = createAnthropic({
          apiKey: this.configService.get<string>('AI_API_KEY'),
        });
        return anthropic(model);
      }

      case AIProvider.OPENAI: {
        const openai = createOpenAI({
          apiKey: this.configService.get<string>('AI_API_KEY'),
        });
        return openai(model);
      }

      case AIProvider.GOOGLE: {
        const google = createGoogleGenerativeAI({
          apiKey: this.configService.get<string>('AI_API_KEY'),
        });
        return google(model);
      }

      case AIProvider.OPENAI_COMPATIBLE: {
        const compatible = createOpenAICompatible({
          name: 'openai-compatible',
          baseURL: this.configService.get<string>('AI_API_URL') || '',
          apiKey: this.configService.get<string>('AI_API_KEY') || 'not-needed',
        });
        return compatible.chatModel(model);
      }

      default: {
        const unknownProvider: string = provider as string;
        throw new Error(`Unknown AI provider: ${unknownProvider}`);
      }
    }
  }

  streamChat(messages: IncomingMessage[]) {
    const modelMessages: ModelMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: this.extractContent(msg),
    }));

    return streamText({
      model: this.model,
      messages: modelMessages,
    });
  }

  private createMcpTool(mcpTool: McpTool, token: string) {
    return dynamicTool({
      description: mcpTool.description,
      inputSchema: jsonSchema(mcpTool.inputSchema),
      execute: async (args) => {
        this.logger.log(`Executing tool: ${mcpTool.name}`);
        const result = await this.mcpService.callTool(token, mcpTool.name, args as Record<string, unknown>);
        const textContent = result.content.find((c) => c.type === 'text');
        return textContent?.text || JSON.stringify(result.content);
      },
    });
  }

  private extractContent(msg: IncomingMessage): string {
    if ('content' in msg && typeof msg.content === 'string' && msg.content.length > 0) {
      return msg.content;
    }
    if ('parts' in msg && Array.isArray(msg.parts)) {
      const textParts = msg.parts.filter(
        (p): p is UIMessagePart & { text: string } => p.type === 'text' && typeof p.text === 'string',
      );
      return textParts.map((p) => p.text).join('');
    }
    return '';
  }

  async streamChatWithTools(messages: IncomingMessage[], enabledTools: string[], token: string) {
    const mcpTools = await this.mcpService.listTools(token);
    const filteredTools = mcpTools.filter((t) => enabledTools.includes(t.name));
    const modelMessages: ModelMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: this.extractContent(msg),
    }));

    if (filteredTools.length === 0) {
      return streamText({
        model: this.model,
        messages: modelMessages,
      });
    }

    const tools = Object.fromEntries(
      filteredTools.map((mcpTool) => [mcpTool.name, this.createMcpTool(mcpTool, token)]),
    );

    return streamText({
      model: this.model,
      messages: modelMessages,
      tools,
      toolChoice: 'auto',
      stopWhen: stepCountIs(5),
    });
  }

  getConfig() {
    const current = {
      provider: this.provider,
      model: this.modelName,
      label: this.configService.get<string>('AI_MODEL_LABEL', this.modelName),
    };

    const availableRaw = this.configService.get<string>('AI_AVAILABLE_MODELS', this.modelName);
    const available = availableRaw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((model) => ({
        provider: this.provider,
        model,
        label: this.configService.get<string>(`AI_MODEL_LABEL_${model}`, model),
      }));

    return {
      current,
      available: available.length ? available : [current],
    };
  }
}

export default AIService;
