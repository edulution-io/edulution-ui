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
import { CoreMessage, generateText, LanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import AiRequestOptions from '@libs/ai/types/aiRequestOptions';
import { SupportedAiProviderType } from '@libs/ai/types/supportedAiProviderType';
import SUPPORTED_AI_PROVIDER from '@libs/ai/types/SupportedAiProvider';
import promptsConfig from '@libs/ai/prompts/prompts.config';

const SUPPORTED_PROVIDERS = [
  SUPPORTED_AI_PROVIDER.OpenAI,
  SUPPORTED_AI_PROVIDER.OpenAICompatible,
  SUPPORTED_AI_PROVIDER.Anthropic,
  SUPPORTED_AI_PROVIDER.Gemini,
];

@Injectable()
class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);

  private provider: SupportedAiProviderType;

  private apiKey: string;

  private apiUrl?: string;

  private defaultModel: string;

  private isConfigured = false;

  private baseClients: {
    openai?: ReturnType<typeof createOpenAI>;
    openaiCompatible?: ReturnType<typeof createOpenAICompatible>;
    anthropic?: ReturnType<typeof createAnthropic>;
    gemini?: ReturnType<typeof createGoogleGenerativeAI>;
  } = {};

  constructor(private configService: ConfigService) {
    const providerEnv = this.configService.get<string>('AI_PROVIDER')?.toLowerCase();

    this.provider = SUPPORTED_PROVIDERS.includes(providerEnv as SupportedAiProviderType)
      ? (providerEnv as SupportedAiProviderType)
      : SUPPORTED_AI_PROVIDER.OpenAI;

    this.apiKey = this.configService.get<string>('AI_API_KEY') || '';
    this.apiUrl = this.configService.get<string>('AI_API_URL') || undefined;
    this.defaultModel = this.configService.get<string>('AI_MODEL') || '';
  }

  onModuleInit() {
    if (!this.defaultModel) {
      this.logger.warn('AI_MODEL is not configured. AI features will be disabled');
      return;
    }

    if (!this.apiKey) {
      this.logger.warn('AI_API_KEY is not configured. AI features will be disabled');
      return;
    }

    this.initializeClient();
    this.isConfigured = true;
    this.logger.log(`AI service initialized with provider: ${this.provider}`);
  }

  private initializeClient() {
    switch (this.provider) {
      case SUPPORTED_AI_PROVIDER.OpenAI:
        this.baseClients.openai = createOpenAI({
          apiKey: this.apiKey,
          baseURL: this.apiUrl,
        });
        break;
      case SUPPORTED_AI_PROVIDER.OpenAICompatible:
        this.baseClients.openaiCompatible = createOpenAICompatible({
          name: 'openai-compatible',
          apiKey: this.apiKey || 'unused',
          baseURL: this.apiUrl || '',
        });
        break;
      case SUPPORTED_AI_PROVIDER.Anthropic:
        this.baseClients.anthropic = createAnthropic({
          apiKey: this.apiKey,
          baseURL: this.apiUrl,
        });
        break;
      case SUPPORTED_AI_PROVIDER.Gemini:
        this.baseClients.gemini = createGoogleGenerativeAI({
          apiKey: this.apiKey,
          baseURL: this.apiUrl,
        });
        break;
      default:
        break;
    }
  }

  async chat(options: AiRequestOptions): Promise<string> {
    if (!this.isConfigured) {
      this.logger.warn('AI service is not configured. Skipping chat request.');
      return '';
    }

    const { prompt, systemPrompt, model, temperature = 0.7 } = options;

    const messages: CoreMessage[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    const languageModel = this.resolveModel(model || this.defaultModel);

    const result = await generateText({
      model: languageModel,
      messages,
      temperature,
    });

    return result.text;
  }

  private resolveModel(modelName: string): LanguageModel {
    switch (this.provider) {
      case SUPPORTED_AI_PROVIDER.Anthropic:
        return this.baseClients.anthropic!(modelName);
      case SUPPORTED_AI_PROVIDER.Gemini:
        return this.baseClients.gemini!(modelName);
      case SUPPORTED_AI_PROVIDER.OpenAICompatible:
        return this.baseClients.openaiCompatible!(modelName);
      case SUPPORTED_AI_PROVIDER.OpenAI:
      default:
        return this.baseClients.openai!(modelName);
    }
  }

  async translateNotification(
    notification: { title: string; body: string },
    targetLanguage: string,
  ): Promise<{ title: string; body: string }> {
    if (!this.isConfigured) {
      return notification;
    }

    try {
      const config = promptsConfig.translation.notification;
      const resultText = await this.chat({
        prompt: JSON.stringify(notification),
        systemPrompt: config.system(targetLanguage),
        temperature: config.temperature,
      });

      const parsed = JSON.parse(resultText) as {
        title?: unknown;
        body?: unknown;
      };

      if (typeof parsed.title !== 'string' || typeof parsed.body !== 'string') {
        this.logger.warn('LLM translation result has invalid structure. Falling back to original notification.');
        return notification;
      }

      return {
        title: parsed.title,
        body: parsed.body,
      };
    } catch (error) {
      this.logger.debug('Error while translating notification. Falling back to original notification.', error);
      return notification;
    }
  }
}

export default AiService;
