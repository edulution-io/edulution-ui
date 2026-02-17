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

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import AI_PROVIDERS from '@libs/aiService/constants/aiProviders';
import AiProviderType from '@libs/aiService/types/aiProviderType';
import CreateAiServiceDto from '@libs/aiService/types/createAiServiceDto';
import FetchAiModelsDto from '@libs/aiService/types/fetchAiModelsDto';
import AiServicePurposeType from '@libs/aiService/types/aiServicePurposeType';
import AI_SERVICE_ERROR_MESSAGES from '@libs/aiService/constants/aiServiceErrorMessages';
import CustomHttpException from '../common/CustomHttpException';
import { AiService, AiServiceDocument } from './ai-service.schema';

const ANTHROPIC_API_VERSION = '2023-06-01';

@Injectable()
class AiServiceService {
  constructor(@InjectModel(AiService.name) private aiServiceModel: Model<AiServiceDocument>) {}

  async findAll(): Promise<AiServiceDocument[]> {
    return this.aiServiceModel.find().exec();
  }

  async create(dto: CreateAiServiceDto): Promise<AiServiceDocument> {
    Logger.log(`Creating AI service: ${dto.name}`, AiServiceService.name);
    return this.aiServiceModel.create(dto);
  }

  async update(id: string, dto: CreateAiServiceDto): Promise<void> {
    const aiService = await this.aiServiceModel.findById(id).exec();
    if (!aiService) {
      throw new CustomHttpException(
        AI_SERVICE_ERROR_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { id },
        AiServiceService.name,
      );
    }
    Object.assign(aiService, dto);
    await aiService.save();
    Logger.log(`Updated AI service: ${id}`, AiServiceService.name);
  }

  async delete(id: string): Promise<void> {
    const aiService = await this.aiServiceModel.findById(id).exec();
    if (!aiService) {
      throw new CustomHttpException(
        AI_SERVICE_ERROR_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { id },
        AiServiceService.name,
      );
    }
    await this.aiServiceModel.findByIdAndDelete(id).exec();
    Logger.log(`Deleted AI service: ${id}`, AiServiceService.name);
  }

  async fetchAvailableModels(request: FetchAiModelsDto): Promise<string[]> {
    const { provider, apiKey } = request;
    const baseUrl = request.baseUrl.replace(/\/+$/, '');

    try {
      if (provider === AI_PROVIDERS.ANTHROPIC) {
        const modelsUrl = baseUrl.endsWith('/v1') ? `${baseUrl}/models` : `${baseUrl}/v1/models`;
        const { data } = await axios.get<{ data: { id: string }[] }>(modelsUrl, {
          headers: { 'x-api-key': apiKey, 'anthropic-version': ANTHROPIC_API_VERSION },
        });
        return data.data.map((m) => m.id);
      }

      if (provider === AI_PROVIDERS.GOOGLE) {
        const googleBaseUrl = baseUrl.endsWith('/v1beta') ? baseUrl : `${baseUrl}/v1beta`;
        const { data } = await axios.get<{ models: { name: string }[] }>(`${googleBaseUrl}/models`, {
          params: { key: apiKey },
        });
        return data.models.map((m) => m.name.replace('models/', ''));
      }

      if (provider === AI_PROVIDERS.OLLAMA) {
        const { data } = await axios.get<{ models: { name: string }[] }>(`${baseUrl}/api/tags`);
        return data.models.map((m) => m.name);
      }

      const { data } = await axios.get<{ data: { id: string }[] }>(`${baseUrl}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return data.data.map((m) => m.id);
    } catch (error) {
      Logger.error(`Failed to fetch models for provider ${provider}: ${error}`, AiServiceService.name);
      throw new CustomHttpException(
        AI_SERVICE_ERROR_MESSAGES.FETCH_MODELS_FAILED,
        HttpStatus.BAD_GATEWAY,
        { provider, baseUrl },
        AiServiceService.name,
      );
    }
  }

  async findByIds(ids: string[]): Promise<AiServiceDocument[]> {
    return this.aiServiceModel.find({ _id: { $in: ids }, isActive: true }).exec();
  }

  async getActiveServiceForPurpose(purpose: AiServicePurposeType): Promise<AiServiceDocument | null> {
    return this.aiServiceModel.findOne({ purpose, isActive: true }).exec();
  }

  createLanguageModel(config: { provider: AiProviderType; baseUrl: string; apiKey: string; model: string }) {
    const { provider, apiKey, model } = config;
    const baseUrl = config.baseUrl.replace(/\/+$/, '');

    if (provider === AI_PROVIDERS.ANTHROPIC) {
      const anthropic = createAnthropic({ baseURL: baseUrl, apiKey });
      return anthropic(model);
    }

    if (provider === AI_PROVIDERS.GOOGLE) {
      const googleBaseUrl = baseUrl.endsWith('/v1beta') ? baseUrl : `${baseUrl}/v1beta`;
      const google = createGoogleGenerativeAI({ baseURL: googleBaseUrl, apiKey });
      return google(model);
    }

    const openAiBaseUrl = provider === AI_PROVIDERS.OLLAMA ? `${baseUrl}/v1` : baseUrl;
    const openaiCompatible = createOpenAI({ baseURL: openAiBaseUrl, apiKey });
    return openaiCompatible(model);
  }
}

export default AiServiceService;
