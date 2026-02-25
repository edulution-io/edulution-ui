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
import CreateAiChatModelDto from '@libs/aiChatModel/types/createAiChatModelDto';
import AiChatModelResponseDto from '@libs/aiChatModel/types/aiChatModelResponseDto';
import AI_CHAT_MODEL_ERROR_MESSAGES from '@libs/aiChatModel/constants/aiChatModelErrorMessages';
import AiChatModelUserDto from '@libs/aiChatModel/types/aiChatModelUserDto';
import CustomHttpException from '../common/CustomHttpException';
import AiServiceService from '../ai-service/ai-service.service';
import { AiChatModel, AiChatModelDocument } from './ai-chat-model.schema';

@Injectable()
class AiChatModelService {
  constructor(
    @InjectModel(AiChatModel.name) private aiChatModelModel: Model<AiChatModelDocument>,
    private readonly aiServiceService: AiServiceService,
  ) {}

  async findAll(): Promise<AiChatModelResponseDto[]> {
    const models = await this.aiChatModelModel.find().exec();
    return this.populateAiServiceNames(models);
  }

  async findById(id: string): Promise<AiChatModelDocument> {
    const model = await this.aiChatModelModel.findById(id).exec();
    if (!model) {
      throw new CustomHttpException(
        AI_CHAT_MODEL_ERROR_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { id },
        AiChatModelService.name,
      );
    }
    return model;
  }

  async create(dto: CreateAiChatModelDto): Promise<AiChatModelResponseDto> {
    await this.validateAiServiceExists(dto.aiServiceId);
    Logger.log(`Creating AI chat model: ${dto.name}`, AiChatModelService.name);
    const model = await this.aiChatModelModel.create(dto);
    const [populated] = await this.populateAiServiceNames([model]);
    return populated;
  }

  async update(id: string, dto: CreateAiChatModelDto): Promise<void> {
    const model = await this.findById(id);
    await this.validateAiServiceExists(dto.aiServiceId);
    Object.assign(model, dto);
    await model.save();
    Logger.log(`Updated AI chat model: ${id}`, AiChatModelService.name);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.aiChatModelModel.findByIdAndDelete(id).exec();
    Logger.log(`Deleted AI chat model: ${id}`, AiChatModelService.name);
  }

  async findAccessibleModels(ldapGroups: string[]): Promise<AiChatModelUserDto[]> {
    const models = await this.aiChatModelModel.find({ isActive: true }).exec();

    const accessibleModels = models.filter((model) =>
      model.accessGroups.some((group) => ldapGroups.includes(group.path)),
    );

    const aiServiceIds = [...new Set(accessibleModels.map((model) => model.aiServiceId))];
    const services = aiServiceIds.length > 0 ? await this.aiServiceService.findByIds(aiServiceIds) : [];
    const serviceMap = new Map(
      services.map((service) => [
        service.id as string,
        { isDataPrivacyCompliant: service.isDataPrivacyCompliant ?? false, capabilities: service.capabilities ?? [] },
      ]),
    );

    return accessibleModels.map((model) => {
      const service = serviceMap.get(model.aiServiceId);
      return {
        id: model.id as string,
        name: model.name,
        isDataPrivacyCompliant: service?.isDataPrivacyCompliant ?? false,
        capabilities: service?.capabilities ?? [],
      };
    });
  }

  private async validateAiServiceExists(aiServiceId: string): Promise<void> {
    const services = await this.aiServiceService.findByIds([aiServiceId]);
    if (services.length === 0) {
      throw new CustomHttpException(
        AI_CHAT_MODEL_ERROR_MESSAGES.AI_SERVICE_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
        { aiServiceId },
        AiChatModelService.name,
      );
    }
  }

  private async populateAiServiceNames(models: AiChatModelDocument[]): Promise<AiChatModelResponseDto[]> {
    const aiServiceIds = [...new Set(models.map((model) => model.aiServiceId))];
    const services = aiServiceIds.length > 0 ? await this.aiServiceService.findByIds(aiServiceIds) : [];
    const serviceNameMap = new Map(services.map((service) => [service.id as string, service.name]));

    return models.map((model) => {
      const json = model.toJSON() as AiChatModelResponseDto;
      return { ...json, aiServiceName: serviceNameMap.get(model.aiServiceId) ?? '' };
    });
  }
}

export default AiChatModelService;
