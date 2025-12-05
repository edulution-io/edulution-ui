/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 */

import { Injectable, Logger } from '@nestjs/common';
import { convertToModelMessages, generateText, LanguageModel, ModelMessage, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import AiRequestOptions from '@libs/ai/types/aiRequestOptions';
import ChatStreamDto from '@libs/ai/types/chatStreamDto';
import SUPPORTED_AI_PROVIDER from '@libs/ai/types/supportedAiProvider';
import type AiConfigDto from '@libs/ai/types/aiConfigDto';
import AI_CONFIG_PURPOSES from '@libs/ai/constants/aiConfigPurposes';
import promptsConfig from '@libs/ai/prompts/prompts.config';
import AiConfigService from './ai.config.service';
import { AiChatHistory } from './ai.chatHistory.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
class AiService {
  constructor(
    private readonly aiConfigService: AiConfigService,
    @InjectModel(AiChatHistory.name) private chatHistoryModel: Model<AiChatHistory>,
  ) {}

  async chatStream(options: ChatStreamDto) {
    const { messages, configId, systemPrompt, temperature = 0.7 } = options;
    const config = await this.resolveConfig(configId);

    const languageModel = this.createLanguageModel(config);

    const result = streamText({
      model: languageModel,
      messages: convertToModelMessages(messages),
      system: systemPrompt || 'Du bist ein hilfreicher Assistent.',
      temperature,
    });

    return result;
  }

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

  async getChatHistory(userId: string): Promise<AiChatHistory[]> {
    return this.chatHistoryModel.find({ userId }).select('id title updatedAt').sort({ updatedAt: -1 }).exec();
  }

  async getChatById(chatId: string, userId: string): Promise<AiChatHistory | null> {
    return this.chatHistoryModel.findOne({ _id: chatId, userId }).exec();
  }

  async createChat(userId: string, title: string, messages: any[]): Promise<AiChatHistory> {
    const chat = new this.chatHistoryModel({
      userId,
      title: title || 'Neuer Chat',
      messages,
    });
    return chat.save();
  }

  async updateChat(chatId: string, userId: string, messages: any[]): Promise<AiChatHistory | null> {
    return this.chatHistoryModel
      .findOneAndUpdate({ _id: chatId, userId }, { messages, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async deleteChat(chatId: string, userId: string): Promise<boolean> {
    const result = await this.chatHistoryModel.deleteOne({ _id: chatId, userId }).exec();
    return result.deletedCount > 0;
  }

  async resolveConfig(configId?: string, purpose?: string): Promise<AiConfigDto> {
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

  public createLanguageModel(config: AiConfigDto, modelOverride?: string): LanguageModel {
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

  generateChatTitle(messages: unknown[]) {
    return Promise.resolve(undefined);
  }
}

export default AiService;
