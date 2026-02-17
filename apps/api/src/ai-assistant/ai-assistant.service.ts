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
import CreateAiAssistantDto from '@libs/aiAssistant/types/createAiAssistantDto';
import AI_ASSISTANT_ERROR_MESSAGES from '@libs/aiAssistant/constants/aiAssistantErrorMessages';
import CustomHttpException from '../common/CustomHttpException';
import { AiAssistant, AiAssistantDocument } from './ai-assistant.schema';

@Injectable()
class AiAssistantService {
  constructor(@InjectModel(AiAssistant.name) private aiAssistantModel: Model<AiAssistantDocument>) {}

  async findAll(): Promise<AiAssistantDocument[]> {
    return this.aiAssistantModel.find().exec();
  }

  async create(dto: CreateAiAssistantDto): Promise<AiAssistantDocument> {
    Logger.log(`Creating AI assistant: ${dto.name}`, AiAssistantService.name);
    return this.aiAssistantModel.create(dto);
  }

  async update(id: string, dto: CreateAiAssistantDto): Promise<void> {
    const assistant = await this.aiAssistantModel.findById(id).exec();
    if (!assistant) {
      throw new CustomHttpException(
        AI_ASSISTANT_ERROR_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { id },
        AiAssistantService.name,
      );
    }
    Object.assign(assistant, dto);
    await assistant.save();
    Logger.log(`Updated AI assistant: ${id}`, AiAssistantService.name);
  }

  async delete(id: string): Promise<void> {
    const assistant = await this.aiAssistantModel.findById(id).exec();
    if (!assistant) {
      throw new CustomHttpException(
        AI_ASSISTANT_ERROR_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { id },
        AiAssistantService.name,
      );
    }
    await this.aiAssistantModel.findByIdAndDelete(id).exec();
    Logger.log(`Deleted AI assistant: ${id}`, AiAssistantService.name);
  }

  async findAccessibleByUser(ldapGroups: string[]): Promise<AiAssistantDocument[]> {
    return this.aiAssistantModel
      .find({
        isActive: true,
        'accessGroups.path': { $in: ldapGroups },
      })
      .exec();
  }

  async findById(id: string): Promise<AiAssistantDocument> {
    const assistant = await this.aiAssistantModel.findById(id).exec();
    if (!assistant) {
      throw new CustomHttpException(
        AI_ASSISTANT_ERROR_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { id },
        AiAssistantService.name,
      );
    }
    return assistant;
  }

  async checkIfNameExists(name: string): Promise<{ exists: boolean }> {
    const result = await this.aiAssistantModel.exists({ name: new RegExp(`^${name}$`, 'i') }).exec();
    return { exists: !!result };
  }
}

export default AiAssistantService;
