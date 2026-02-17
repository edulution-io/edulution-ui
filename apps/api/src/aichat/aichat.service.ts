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
import { streamText, UIMessage } from 'ai';
import type { LanguageModelV3 } from '@ai-sdk/provider';
import type { ModelMessage, UserModelMessage, AssistantModelMessage } from '@ai-sdk/provider-utils';
import CHAT_ROLES from '@libs/chat/constants/chatRoles';
import extractTextFromParts from '@libs/chat/utils/extractTextFromParts';
import { AICHAT_ERROR_MESSAGES } from '@libs/chat/types/aiChatErrorMessages';
import AI_SERVICE_PURPOSES from '@libs/aiService/constants/aiServicePurposes';
import AiProviderType from '@libs/aiService/types/aiProviderType';
import CustomHttpException from '../common/CustomHttpException';
import AiServiceService from '../ai-service/ai-service.service';
import { AiConversation, AiConversationDocument } from './schemas/aiConversation.schema';
import { AiChatMessage, AiChatMessageDocument } from './schemas/aiChatMessage.schema';

@Injectable()
class AiChatService {
  constructor(
    @InjectModel(AiConversation.name) private aiConversationModel: Model<AiConversationDocument>,
    @InjectModel(AiChatMessage.name) private aiChatMessageModel: Model<AiChatMessageDocument>,
    private readonly aiServiceService: AiServiceService,
  ) {}

  async getConversations(username: string): Promise<AiConversationDocument[]> {
    return this.aiConversationModel.find({ username }).sort({ lastMessageAt: -1 }).exec();
  }

  async createConversation(username: string, title: string): Promise<AiConversationDocument> {
    return this.aiConversationModel.create({
      username,
      title,
      lastMessageAt: new Date(),
    });
  }

  async deleteConversation(id: string, username: string): Promise<void> {
    await this.getOwnedConversation(id, username);
    await this.aiChatMessageModel.deleteMany({ conversationId: id });
    await this.aiConversationModel.findByIdAndDelete(id);
    Logger.log(`Deleted conversation ${id}`, AiChatService.name);
  }

  async updateConversationTitle(id: string, username: string, title: string): Promise<AiConversationDocument> {
    await this.getOwnedConversation(id, username);
    const updated = await this.aiConversationModel.findByIdAndUpdate(id, { title }, { new: true });
    if (!updated) {
      throw new CustomHttpException(
        AICHAT_ERROR_MESSAGES.CONVERSATION_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { id },
        AiChatService.name,
      );
    }
    return updated;
  }

  async getMessages(
    conversationId: string,
    username: string,
    limit: number,
    offset: number,
  ): Promise<AiChatMessageDocument[]> {
    await this.getOwnedConversation(conversationId, username);
    return this.aiChatMessageModel.find({ conversationId }).sort({ createdAt: -1 }).skip(offset).limit(limit).exec();
  }

  async streamChat(conversationId: string, messages: UIMessage[], username: string) {
    await this.getOwnedConversation(conversationId, username);

    const lastUserMessage = [...messages].reverse().find((m) => m.role === CHAT_ROLES.USER);
    if (lastUserMessage) {
      const textContent = extractTextFromParts(lastUserMessage.parts);
      if (textContent) {
        await this.saveMessage(conversationId, CHAT_ROLES.USER, textContent, username);
      }
    }

    const modelMessages: ModelMessage[] = messages
      .filter((msg) => msg.role === CHAT_ROLES.USER || msg.role === CHAT_ROLES.ASSISTANT)
      .map((msg): UserModelMessage | AssistantModelMessage => ({
        role: msg.role as 'user' | 'assistant',
        content: [{ type: 'text', text: extractTextFromParts(msg.parts) }],
      }));

    const model = await this.resolveLanguageModel();

    const result = streamText({
      model,
      messages: modelMessages,
    });

    return { result: result as ReturnType<typeof streamText>, conversationId, username };
  }

  async saveMessage(
    conversationId: string,
    role: string,
    content: string,
    username: string,
  ): Promise<AiChatMessageDocument> {
    const message = await this.aiChatMessageModel.create({
      conversationId,
      role,
      content,
      createdBy: role === CHAT_ROLES.ASSISTANT ? CHAT_ROLES.ASSISTANT : username,
    });
    await this.aiConversationModel.findByIdAndUpdate(conversationId, { lastMessageAt: new Date() });
    return message;
  }

  private async resolveLanguageModel(): Promise<LanguageModelV3> {
    const dbConfig = await this.aiServiceService.getActiveServiceForPurpose(AI_SERVICE_PURPOSES.CHAT);

    if (!dbConfig) {
      throw new CustomHttpException(
        AICHAT_ERROR_MESSAGES.NO_ACTIVE_AI_SERVICE,
        HttpStatus.SERVICE_UNAVAILABLE,
        {},
        AiChatService.name,
      );
    }

    return this.createModelFromService(dbConfig);
  }

  private createModelFromService(service: {
    provider: string;
    baseUrl: string;
    apiKey: string;
    model: string;
  }): LanguageModelV3 {
    return this.aiServiceService.createLanguageModel({
      provider: service.provider as AiProviderType,
      baseUrl: service.baseUrl,
      apiKey: service.apiKey,
      model: service.model,
    });
  }

  private async getOwnedConversation(id: string, username: string): Promise<AiConversationDocument> {
    const conversation = await this.aiConversationModel.findById(id);
    if (!conversation) {
      throw new CustomHttpException(
        AICHAT_ERROR_MESSAGES.CONVERSATION_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { id },
        AiChatService.name,
      );
    }
    if (conversation.username !== username) {
      throw new CustomHttpException(
        AICHAT_ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
        HttpStatus.FORBIDDEN,
        { id, username },
        AiChatService.name,
      );
    }
    return conversation;
  }
}

export default AiChatService;
