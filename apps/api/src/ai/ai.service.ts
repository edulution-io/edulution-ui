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
import axios, { AxiosInstance } from 'axios';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import AiRequestOptions from '@libs/ai/types/aiRequestOptions';
import ChatMessage from '@libs/ai/types/chatMessage';
import ChatCompletionResponse from '@libs/ai/types/chatCompletionResponse';
import getRandomUUID from '@/utils/getRandomUUID';

@Injectable()
class AiService {
  private client: AxiosInstance;

  private readonly defaultModel: string;

  constructor(private configService: ConfigService) {
    const baseUrl = this.configService.get<string>('AI_API_URL') || '';
    const apiKey = this.configService.get<string>('AI_API_KEY') || '';

    this.defaultModel = this.configService.get<string>('AI_MODEL') || '';

    const normalizedUrl = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;

    this.client = axios.create({
      baseURL: normalizedUrl,
      headers: {
        [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_JSON,
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
    });
  }

  async chat(options: AiRequestOptions): Promise<string> {
    const { prompt, systemPrompt, model, maxTokens = 1024, temperature = 0.7 } = options;

    const messages: ChatMessage[] = [];

    if (systemPrompt) {
      messages.push({ id: getRandomUUID(), role: 'system', content: systemPrompt });
    }

    messages.push({ id: getRandomUUID(), role: 'user', content: prompt });

    const response = await this.client.post<ChatCompletionResponse>('/chat/completions', {
      model: model || this.defaultModel,
      messages,
      max_tokens: maxTokens,
      temperature,
    });

    return response.data.choices[0]?.message?.content || '';
  }

  async translateNotification(
    notification: { title: string; body: string },
    targetLanguage: string,
  ): Promise<{ title: string; body: string }> {
    try {
      const result = await this.chat({
        prompt: JSON.stringify(notification),
        systemPrompt: `You are a translator. Translate the JSON notification to ${targetLanguage}. Return only valid JSON with "title" and "body" fields, nothing else.`,
        temperature: 0.3,
      });

      return JSON.parse(result) as { title: string; body: string };
    } catch (error) {
      return notification;
    }
  }
}

export default AiService;
