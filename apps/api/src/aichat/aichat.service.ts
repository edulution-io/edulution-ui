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
import { streamText, generateText, stepCountIs, UIMessage } from 'ai';
import type { LanguageModelV3 } from '@ai-sdk/provider';
import type { ModelMessage, UserModelMessage, AssistantModelMessage } from '@ai-sdk/provider-utils';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import CHAT_ROLES from '@libs/chat/constants/chatRoles';
import extractTextFromParts from '@libs/chat/utils/extractTextFromParts';
import { AICHAT_ERROR_MESSAGES } from '@libs/chat/types/aiChatErrorMessages';
import AI_SERVICE_PURPOSES from '@libs/aiService/constants/aiServicePurposes';
import AiProviderType from '@libs/aiService/types/aiProviderType';
import AI_CHAT_MODEL_ERROR_MESSAGES from '@libs/aiChatModel/constants/aiChatModelErrorMessages';
import CustomHttpException from '../common/CustomHttpException';
import AppConfigService from '../appconfig/appconfig.service';
import AiServiceService from '../ai-service/ai-service.service';
import AiChatModelService from '../ai-chat-model/ai-chat-model.service';
import { AiConversation, AiConversationDocument } from './schemas/aiConversation.schema';
import { AiChatMessage, AiChatMessageDocument } from './schemas/aiChatMessage.schema';
import createWebSearchTool from './tools/createWebSearchTool';
import createExecuteCodeTool from './tools/createExecuteCodeTool';
import extractFileContent from './tools/extractFileContent';

@Injectable()
class AiChatService {
  constructor(
    @InjectModel(AiConversation.name) private aiConversationModel: Model<AiConversationDocument>,
    @InjectModel(AiChatMessage.name) private aiChatMessageModel: Model<AiChatMessageDocument>,
    private readonly appConfigService: AppConfigService,
    private readonly aiServiceService: AiServiceService,
    private readonly aiChatModelService: AiChatModelService,
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

  async streamChat(
    conversationId: string,
    messages: UIMessage[],
    username: string,
    ldapGroups?: string[],
    modelConfigId?: string,
  ): Promise<{ result: ReturnType<typeof streamText>; conversationId: string; username: string }> {
    await this.getOwnedConversation(conversationId, username);

    const lastUserMessage = [...messages].reverse().find((message) => message.role === CHAT_ROLES.USER);
    if (lastUserMessage) {
      const textContent = extractTextFromParts(lastUserMessage.parts);
      if (textContent) {
        await this.saveMessage(conversationId, CHAT_ROLES.USER, textContent, username);
      }
    }

    const { model, systemPrompt } = await this.resolveLanguageModel(ldapGroups, modelConfigId);
    const chatConfig = await this.appConfigService.getAppConfigByName(APPS.CHAT);
    const extendedOptions = (chatConfig?.extendedOptions ?? {}) as Record<string, unknown>;
    const tikaUrl = AiChatService.getStringOption(extendedOptions, ExtendedOptionKeys.CHAT_TIKA_URL);

    const modelMessages = await AiChatService.buildModelMessages(messages, tikaUrl);

    const tools = this.buildTools(extendedOptions);

    const result = streamText({
      model,
      messages: modelMessages,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      ...(tools ? { tools, stopWhen: stepCountIs(5) } : {}),
    });

    return { result: result as unknown as ReturnType<typeof streamText>, conversationId, username };
  }

  async generateTitle(
    conversationId: string,
    username: string,
    ldapGroups?: string[],
    modelConfigId?: string,
  ): Promise<string> {
    const recentMessages = await this.aiChatMessageModel
      .find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(4)
      .exec();

    const transcript = recentMessages
      .map((msg) => `${msg.role === CHAT_ROLES.USER ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const { model } = await this.resolveLanguageModel(ldapGroups, modelConfigId);

    const { text } = await generateText({
      model,
      system:
        'Generate a short, descriptive title (max 6 words) for the following conversation. The title MUST be in the same language as the user message. Reply with ONLY the title, nothing else. No quotes, no punctuation, no explanation.',
      prompt: transcript,
    });

    const title = text.trim();
    await this.updateConversationTitle(conversationId, username, title);
    return title;
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

  private async resolveLanguageModel(
    ldapGroups?: string[],
    modelConfigId?: string,
  ): Promise<{ model: LanguageModelV3; systemPrompt?: string }> {
    if (modelConfigId) {
      if (!ldapGroups) {
        throw new CustomHttpException(
          AI_CHAT_MODEL_ERROR_MESSAGES.ACCESS_DENIED,
          HttpStatus.FORBIDDEN,
          { modelConfigId },
          AiChatService.name,
        );
      }

      const chatModel = await this.aiChatModelService.findById(modelConfigId);

      if (!chatModel.isActive) {
        throw new CustomHttpException(
          AI_CHAT_MODEL_ERROR_MESSAGES.NOT_FOUND,
          HttpStatus.BAD_REQUEST,
          { modelConfigId },
          AiChatService.name,
        );
      }

      const hasAccess = chatModel.accessGroups.some((group) => ldapGroups.includes(group.path));

      if (!hasAccess) {
        throw new CustomHttpException(
          AI_CHAT_MODEL_ERROR_MESSAGES.ACCESS_DENIED,
          HttpStatus.FORBIDDEN,
          { modelConfigId },
          AiChatService.name,
        );
      }

      const services = await this.aiServiceService.findByIds([chatModel.aiServiceId]);
      if (services.length === 0) {
        throw new CustomHttpException(
          AI_CHAT_MODEL_ERROR_MESSAGES.AI_SERVICE_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
          { aiServiceId: chatModel.aiServiceId },
          AiChatService.name,
        );
      }

      const service = services[0];
      const model = this.createModelFromService(service);
      return { model, systemPrompt: chatModel.systemPrompt || undefined };
    }

    const dbConfig = await this.aiServiceService.getActiveServiceForPurpose(AI_SERVICE_PURPOSES.CHAT);

    if (!dbConfig) {
      throw new CustomHttpException(
        AICHAT_ERROR_MESSAGES.NO_ACTIVE_AI_SERVICE,
        HttpStatus.SERVICE_UNAVAILABLE,
        {},
        AiChatService.name,
      );
    }

    return { model: this.createModelFromService(dbConfig) };
  }

  private createModelFromService(service: {
    provider: string;
    baseUrl: string;
    apiKey: string;
    model: string;
  }): LanguageModelV3 {
    return AiServiceService.createLanguageModel({
      provider: service.provider as AiProviderType,
      baseUrl: service.baseUrl,
      apiKey: service.apiKey,
      model: service.model,
    });
  }

  private static async buildModelMessages(messages: UIMessage[], tikaUrl?: string): Promise<ModelMessage[]> {
    const filtered = messages.filter(
      (message) => message.role === CHAT_ROLES.USER || message.role === CHAT_ROLES.ASSISTANT,
    );

    return Promise.all(
      filtered.map(async (message): Promise<UserModelMessage | AssistantModelMessage> => {
        const textContent = extractTextFromParts(message.parts);

        if (message.role !== CHAT_ROLES.USER || !tikaUrl) {
          return {
            role: message.role as 'user' | 'assistant',
            content: [{ type: 'text', text: textContent }],
          };
        }

        const fileParts = message.parts.filter(
          (part): part is Extract<typeof part, { type: 'file' }> => part.type === 'file',
        );

        const fileTexts = await Promise.all(
          fileParts.map(async (filePart) => {
            const dataUrlMatch = filePart.url.match(/^data:([^;]+);base64,(.+)$/);
            if (!dataUrlMatch) return '';
            const mimeType = dataUrlMatch[1];
            const base64Data = dataUrlMatch[2];
            const extracted = await extractFileContent(tikaUrl, base64Data, mimeType, filePart.filename);
            if (!extracted) return '';
            const label = filePart.filename ?? 'document';
            return `[Content of "${label}"]\n${extracted}\n[End of "${label}"]`;
          }),
        );

        const combinedContent = [textContent, ...fileTexts].filter(Boolean).join('\n\n');

        return {
          role: 'user' as const,
          content: [{ type: 'text', text: combinedContent }],
        };
      }),
    );
  }

  private buildTools(extendedOptions: Record<string, unknown>) {
    const searxngUrl = AiChatService.getStringOption(extendedOptions, ExtendedOptionKeys.CHAT_SEARXNG_URL);
    const codeSandboxUrl = AiChatService.getStringOption(extendedOptions, ExtendedOptionKeys.CHAT_CODE_SANDBOX_URL);

    const tools = {
      ...(searxngUrl ? { webSearch: createWebSearchTool(searxngUrl) } : {}),
      ...(codeSandboxUrl ? { executeCode: createExecuteCodeTool(codeSandboxUrl) } : {}),
    };

    return Object.keys(tools).length > 0 ? tools : undefined;
  }

  private static getStringOption(extendedOptions: Record<string, unknown>, key: string): string | undefined {
    const value = extendedOptions[key];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
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
