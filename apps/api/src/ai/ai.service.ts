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

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoreMessage, generateText, LanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import AiRequestOptions from '@libs/ai/types/aiRequestOptions';
import { SupportedProviderType } from '@libs/ai/types/supportedProviderType';
import SupportedProvider from '@libs/ai/types/supportedProvider';

@Injectable()
class AiService {
  private readonly provider: SupportedProviderType;

  private readonly apiKey: string;

  private readonly apiUrl?: string;

  private readonly defaultModel: string;

  private readonly baseClients: {
    openai?: ReturnType<typeof createOpenAI>;
    openaiCompatible?: ReturnType<typeof createOpenAICompatible>;
    anthropic?: ReturnType<typeof createAnthropic>;
    gemini?: ReturnType<typeof createGoogleGenerativeAI>;
  };

  constructor(private configService: ConfigService) {
    const providerEnv = this.configService.get<string>('AI_PROVIDER')?.toLowerCase();

    if (
      providerEnv === SupportedProvider.OpenAI ||
      providerEnv === SupportedProvider.OpenAICompatible ||
      providerEnv === SupportedProvider.Anthropic ||
      providerEnv === SupportedProvider.Gemini
    ) {
      this.provider = providerEnv;
    } else {
      this.provider = SupportedProvider.OpenAI;
    }

    this.apiKey = this.configService.get<string>('AI_API_KEY') || '';
    this.apiUrl = this.configService.get<string>('AI_API_URL') || undefined;
    this.defaultModel = this.configService.get<string>('AI_MODEL') || '';

    if (!this.defaultModel) {
      throw new Error('AI_MODEL is not configured');
    }

    this.baseClients = {};

    if (this.provider === SupportedProvider.OpenAI) {
      this.baseClients.openai = createOpenAI({
        apiKey: this.apiKey,
        baseURL: this.apiUrl,
      });
    }

    if (this.provider === SupportedProvider.OpenAICompatible) {
      this.baseClients.openaiCompatible = createOpenAICompatible({
        name: 'openai-compatible',
        apiKey: this.apiKey || 'unused',
        baseURL: this.apiUrl || '',
      });
    }

    if (this.provider === SupportedProvider.Anthropic) {
      this.baseClients.anthropic = createAnthropic({
        apiKey: this.apiKey,
        baseURL: this.apiUrl,
      });
    }

    if (this.provider === SupportedProvider.Gemini) {
      this.baseClients.gemini = createGoogleGenerativeAI({
        apiKey: this.apiKey,
        baseURL: this.apiUrl,
      });
    }
  }

  async chat(options: AiRequestOptions): Promise<string> {
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
      case SupportedProvider.Anthropic: {
        if (!this.baseClients.anthropic) {
          this.baseClients.anthropic = createAnthropic({
            apiKey: this.apiKey,
            baseURL: this.apiUrl,
          });
        }
        return this.baseClients.anthropic(modelName);
      }
      case SupportedProvider.Gemini: {
        if (!this.baseClients.gemini) {
          this.baseClients.gemini = createGoogleGenerativeAI({
            apiKey: this.apiKey,
            baseURL: this.apiUrl,
          });
        }
        return this.baseClients.gemini(modelName);
      }
      case SupportedProvider.OpenAICompatible: {
        if (!this.baseClients.openaiCompatible) {
          this.baseClients.openaiCompatible = createOpenAICompatible({
            name: 'openai-compatible',
            apiKey: this.apiKey || 'unused',
            baseURL: this.apiUrl || '',
          });
        }
        return this.baseClients.openaiCompatible(modelName);
      }
      case SupportedProvider.OpenAI:
      default: {
        if (!this.baseClients.openai) {
          this.baseClients.openai = createOpenAI({
            apiKey: this.apiKey,
            baseURL: this.apiUrl,
          });
        }
        return this.baseClients.openai(modelName);
      }
    }
  }

  async translateNotification(
    notification: { title: string; body: string },
    targetLanguage: string,
  ): Promise<{ title: string; body: string }> {
    try {
      const resultText = await this.chat({
        prompt: JSON.stringify(notification),
        systemPrompt: [
          'You are a translator.',
          `Translate the JSON notification to language code "${targetLanguage}".`,
          'Return only valid JSON with "title" and "body" fields, nothing else.',
          'Do not add explanations, comments or extra fields.',
        ].join(' '),
        temperature: 0.3,
      });

      const parsed = JSON.parse(resultText) as {
        title?: unknown;
        body?: unknown;
      };

      if (typeof parsed.title !== 'string' || typeof parsed.body !== 'string') {
        console.warn('LLM translation result has invalid structure. Falling back to original notification.');
        return notification;
      }

      return {
        title: parsed.title,
        body: parsed.body,
      };
    } catch (error) {
      console.error('Error while translating notification. Falling back to original notification.', error);
      return notification;
    }
  }
}

export default AiService;
