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

/*
 * Copyright Header ...
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import type AiConfigDto from '@libs/ai/types/aiConfigDto';
import aiApiConfigs from '@libs/ai/constants/aiApiConfigs';
import modelFetchConfig from '@libs/ai/utils/modelFetchConfig';
import ModelListResponse from '@libs/ai/types/modelListResponse';
import AppConfigErrorMessages from '@libs/appconfig/types/appConfigErrorMessages';
import UserErrorMessages from '@libs/user/constants/user-error-messages';
import { AiConfigPurposeType } from '@libs/ai/types/aiConfigPurposeType';
import AiConfig, { AiConfigDocument } from './ai.config.schema';
import CustomHttpException from '../common/CustomHttpException';

@Injectable()
class AiConfigService {
  constructor(@InjectModel(AiConfig.name) private aiConfigModel: Model<AiConfigDocument>) {}

  private async validateUniquePurposes(purposes: AiConfigPurposeType[], excludeId?: string): Promise<void> {
    if (!purposes || purposes.length === 0) return;

    const query: Record<string, unknown> = { purposes: { $in: purposes } };
    if (excludeId) {
      query.id = { $ne: excludeId };
    }

    const existing = await this.aiConfigModel.findOne(query).lean();

    if (existing) {
      throw new CustomHttpException(UserErrorMessages.NotFoundError, HttpStatus.CONFLICT);
    }
  }

  async getAll(): Promise<AiConfigDto[]> {
    const configs = await this.aiConfigModel.find();
    return configs.map((config) => config.toJSON() as unknown as AiConfigDto);
  }

  async getById(id: string): Promise<AiConfigDto | null> {
    const config = await this.aiConfigModel.findById(id);
    return config ? (config.toJSON() as unknown as AiConfigDto) : null;
  }

  async getByPurpose(purpose: string): Promise<AiConfigDto | null> {
    const config = await this.aiConfigModel.findOne({ purposes: purpose });
    return config ? (config.toJSON() as unknown as AiConfigDto) : null;
  }

  async create(config: Omit<AiConfigDto, 'id'>): Promise<AiConfigDto> {
    await this.validateUniquePurposes(config.purposes);
    const created = await this.aiConfigModel.create(config);
    return created.toJSON() as unknown as AiConfigDto;
  }

  async update(id: string, config: AiConfigDto): Promise<AiConfigDto> {
    await this.validateUniquePurposes(config.purposes, id);
    const updated = await this.aiConfigModel.findByIdAndUpdate(id, { $set: config }, { new: true });

    if (!updated) {
      throw new CustomHttpException(AppConfigErrorMessages.WriteAppConfigFailed, HttpStatus.NOT_FOUND);
    }

    return updated.toJSON() as unknown as AiConfigDto;
  }

  async delete(id: string): Promise<void> {
    const result = await this.aiConfigModel.findByIdAndDelete(id);
    if (!result) {
      throw new CustomHttpException(AppConfigErrorMessages.WriteAppConfigFailed, HttpStatus.NOT_FOUND);
    }
  }

  async testConnection(config: {
    url: string;
    apiKey: string;
    aiModel: string;
    apiStandard: string;
  }): Promise<{ success: boolean; message: string }> {
    const { url, apiKey = '', aiModel, apiStandard } = config;

    if (!url || !aiModel || !apiStandard) {
      return { success: false, message: 'Missing required fields' };
    }

    const configBuilder = aiApiConfigs[apiStandard as keyof typeof aiApiConfigs];
    if (!configBuilder) {
      return { success: false, message: `Unknown API standard: ${apiStandard}` };
    }

    const { endpoint, headers, body } = configBuilder(url, apiKey, aiModel);

    try {
      await axios.post(endpoint, body, {
        headers: { 'Content-Type': 'application/json', ...headers },
        timeout: 10000,
      });
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: { message?: string } })?.error?.message ?? error.message)
        : 'Connection failed';
      return { success: false, message };
    }
  }

  async getAvailableModels(
    url: string,
    apiKey: string,
    apiStandard: string,
  ): Promise<{ success: boolean; models: string[]; message?: string }> {
    try {
      const config = modelFetchConfig[apiStandard];

      if (!config) {
        return { success: false, models: [], message: `Unknown provider: ${apiStandard}` };
      }

      const response = await axios.get<ModelListResponse>(config.getUrl(url, apiKey), {
        headers: config.getHeaders(apiKey),
        timeout: 10000,
      });

      return { success: true, models: config.extractModels(response.data) };
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: { message?: string } })?.error?.message ?? error.message)
        : 'Failed to fetch models';
      return { success: false, models: [], message };
    }
  }
}

export default AiConfigService;
