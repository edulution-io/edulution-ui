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
import { generateText, LanguageModel, ModelMessage } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import AiRequestOptions from '@libs/ai/types/aiRequestOptions';
import SUPPORTED_AI_PROVIDER from '@libs/ai/types/SupportedAiProvider';
import type AiConfigDto from '@libs/ai/types/aiConfigDto';
import AI_CONFIG_PURPOSES from '@libs/ai/constants/aiConfigPurposes';
import promptsConfig from '@libs/ai/prompts/prompts.config';
import AiConfigService from './ai.config.service';

@Injectable()
class AiService {
  constructor(private readonly aiConfigService: AiConfigService) {}

  async chat(options: AiRequestOptions & { configId?: string; purpose?: string }): Promise<string> {
    const { prompt, systemPrompt, model, temperature = 0.7, configId, purpose } = options;
    const config = await this.resolveConfig(configId, purpose);

    const languageModel = this.createLanguageModel(config, model);

    const messages: ModelMessage[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    const result = await generateText({
      model: languageModel,
      messages,
      temperature,
    });

    return result.text;
  }

  async translateNotification(
    notification: { title: string; body: string },
    targetLanguage: string,
  ): Promise<{ title: string; body: string }> {
    try {
      const config = promptsConfig.translation.notification;
      const resultText = await this.chat({
        purpose: AI_CONFIG_PURPOSES.TRANSLATION,
        prompt: JSON.stringify(notification),
        systemPrompt: config.system(targetLanguage),
        temperature: config.temperature,
      });

      const parsed = JSON.parse(resultText) as { title?: unknown; body?: unknown };

      if (typeof parsed.title !== 'string' || typeof parsed.body !== 'string') {
        Logger.warn('LLM translation result has invalid structure. Falling back to original.');
        return notification;
      }

      return { title: parsed.title, body: parsed.body };
    } catch (error) {
      Logger.error('Error while translating notification. Falling back to original.', error);
      return notification;
    }
  }

  private async resolveConfig(configId?: string, purpose?: string): Promise<AiConfigDto> {
    let config: AiConfigDto | null;

    if (configId) {
      config = await this.aiConfigService.getById(configId);
    } else if (purpose) {
      config = await this.aiConfigService.getByPurpose(purpose);
    } else {
      const configs = await this.aiConfigService.getAll();
      config = configs[0] ?? null;
    }

    if (!config) {
      throw new Error('No AI configuration found');
    }

    return config;
  }

  private createLanguageModel(config: AiConfigDto, modelOverride?: string): LanguageModel {
    const modelName = modelOverride || config.aiModel;

    switch (config.apiStandard) {
      case SUPPORTED_AI_PROVIDER.Anthropic:
        return createAnthropic({
          apiKey: config.apiKey,
          baseURL: config.url || undefined,
        })(modelName);

      case SUPPORTED_AI_PROVIDER.Google:
        return createGoogleGenerativeAI({
          apiKey: config.apiKey,
          baseURL: config.url || undefined,
        })(modelName);

      case SUPPORTED_AI_PROVIDER.OpenAICompatible: {
        const baseUrl = config.url.endsWith('/v1') ? config.url : `${config.url}/v1`;
        return createOpenAICompatible({
          name: 'openai-compatible',
          apiKey: config.apiKey || 'unused',
          baseURL: baseUrl,
        })(modelName);
      }

      case SUPPORTED_AI_PROVIDER.OpenAI:
      default: {
        const baseUrl = config.url.endsWith('/v1') ? config.url : `${config.url}/v1`;
        return createOpenAI({
          apiKey: config.apiKey,
          baseURL: baseUrl,
        })(modelName);
      }
    }
  }
}

export default AiService;
