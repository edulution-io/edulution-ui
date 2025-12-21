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
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import AIChatMessage from '@libs/ai/types/aiChatMessage';
import ChatType from '@libs/chat/types/chatType';
import Chat, { ChatDocument } from './schemas/chat.schema';
import EventsService from '../events/events.service';
import { createChatChannelCreatedEvent, createChatMessageSentEvent } from '../events/event-factories';

@Injectable()
class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(Chat.name) private ChatModel: Model<ChatDocument>,
    private readonly eventsService: EventsService,
  ) {}

  async createAIChat(
    ownerUsername: string,
    aiProvider?: string,
    aiModel?: string,
    aiModelLabel?: string,
  ): Promise<ChatDocument> {
    const chat = new this.ChatModel({
      type: ChatType.AI,
      ownerUsername,
      participants: [{ username: ownerUsername }, { username: 'ai-assistant', displayName: aiModelLabel, isAI: true }],
      aiProvider,
      aiModel,
    });
    const savedChat = await chat.save();

    this.publishChatChannelCreatedEvent(ownerUsername, savedChat._id.toString(), 'ai', 2);

    return savedChat;
  }

  private publishChatChannelCreatedEvent(
    userId: string,
    chatId: string,
    chatType: 'user' | 'group' | 'ai',
    participantCount: number,
  ): void {
    const event = createChatChannelCreatedEvent({
      userId,
      chatId,
      chatType,
      participantCount,
    });
    this.eventsService.publish(event).catch((err) => {
      this.logger.warn(`Failed to publish chat.channel_created event: ${err.message}`);
    });
  }

  async getAIChats(ownerUsername: string): Promise<ChatDocument[]> {
    return this.ChatModel.find({ ownerUsername, type: ChatType.AI })
      .select('_id title updatedAt aiModel')
      .sort({ updatedAt: -1 })
      .limit(50)
      .exec();
  }

  private extractMessageContent(msg: AIChatMessage): string {
    if (msg.content) {
      return msg.content;
    }
    if (msg.parts && Array.isArray(msg.parts)) {
      const textParts = msg.parts.filter((p) => p.type === 'text' && typeof p.text === 'string');
      return textParts.map((p) => p.text || '').join('');
    }
    return '';
  }

  async saveAIMessages(chatId: string, messages: AIChatMessage[], ownerUsername: string): Promise<ChatDocument | null> {
    this.logger.debug(`saveAIMessages called with ${messages.length} messages`);
    this.logger.debug(`First message: ${JSON.stringify(messages[0])}`);

    const chatMessages = messages.map((msg) => ({
      senderUsername: msg.role === 'user' ? ownerUsername : 'ai-assistant',
      content: this.extractMessageContent(msg),
      role: msg.role,
      isAI: msg.role === 'assistant',
    }));

    const firstUserMessage = messages.find((m) => m.role === 'user');
    this.logger.debug(`First user message: ${JSON.stringify(firstUserMessage)}`);

    const firstUserContent = firstUserMessage ? this.extractMessageContent(firstUserMessage) : '';
    this.logger.debug(`Extracted content: "${firstUserContent}"`);

    const title = firstUserContent
      ? `${firstUserContent.slice(0, 50)}${firstUserContent.length > 50 ? '...' : ''}`
      : undefined;
    this.logger.debug(`Generated title: "${title}"`);

    return this.ChatModel.findByIdAndUpdate(
      chatId,
      {
        $set: {
          messages: chatMessages,
          ...(title && { title }),
        },
      },
      { new: true },
    ).exec();
  }

  async findOrCreateUserChat(
    username1: string,
    username2: string,
    user1Info?: { displayName?: string; firstName?: string; lastName?: string },
    user2Info?: { displayName?: string; firstName?: string; lastName?: string },
  ): Promise<ChatDocument> {
    const existingChat = await this.ChatModel.findOne({
      type: ChatType.USER,
      'participants.username': { $all: [username1, username2] },
      participants: { $size: 2 },
    }).exec();

    if (existingChat) {
      return existingChat;
    }

    const chat = new this.ChatModel({
      type: ChatType.USER,
      ownerUsername: username1,
      participants: [
        { username: username1, ...user1Info },
        { username: username2, ...user2Info },
      ],
    });
    const savedChat = await chat.save();

    this.publishChatChannelCreatedEvent(username1, savedChat._id.toString(), 'user', 2);

    return savedChat;
  }

  async getUserChats(username: string): Promise<ChatDocument[]> {
    return this.ChatModel.find({
      type: ChatType.USER,
      'participants.username': username,
    })
      .select('_id participants updatedAt messages')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findOrCreateGroupChat(groupCn: string, groupName: string, ownerUsername: string): Promise<ChatDocument> {
    const existingChat = await this.ChatModel.findOne({ type: ChatType.GROUP, groupCn }).exec();

    if (existingChat) {
      return existingChat;
    }

    const chat = new this.ChatModel({
      type: ChatType.GROUP,
      ownerUsername,
      groupCn,
      groupName,
      participants: [{ username: ownerUsername }],
    });
    const savedChat = await chat.save();

    this.publishChatChannelCreatedEvent(ownerUsername, savedChat._id.toString(), 'group', 1);

    return savedChat;
  }

  async getGroupChats(username: string): Promise<ChatDocument[]> {
    return this.ChatModel.find({
      type: ChatType.GROUP,
      'participants.username': username,
    })
      .select('_id groupCn groupName updatedAt')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async addParticipantToGroup(
    chatId: string,
    participant: {
      username: string;
      displayName?: string;
      firstName?: string;
      lastName?: string;
    },
  ): Promise<ChatDocument | null> {
    return this.ChatModel.findByIdAndUpdate(chatId, { $addToSet: { participants: participant } }, { new: true }).exec();
  }

  async getChat(chatId: string, username: string): Promise<ChatDocument | null> {
    return this.ChatModel.findOne({
      _id: chatId,
      $or: [{ ownerUsername: username }, { 'participants.username': username }],
    }).exec();
  }

  async addMessage(
    chatId: string,
    message: {
      senderUsername: string;
      content: string;
      role: string;
      isAI?: boolean;
    },
  ): Promise<ChatDocument | null> {
    const updatedChat = await this.ChatModel.findByIdAndUpdate(
      chatId,
      {
        $push: { messages: message },
      },
      { new: true },
    ).exec();

    if (updatedChat) {
      const chatType = this.getChatTypeString(updatedChat.type);
      this.publishChatMessageSentEvent(
        message.senderUsername,
        chatId,
        chatType,
        message.content.length,
        message.isAI || false,
      );
    }

    return updatedChat;
  }

  private getChatTypeString(type: string): 'user' | 'group' | 'ai' {
    if (type === ChatType.AI) return 'ai';
    if (type === ChatType.GROUP) return 'group';
    return 'user';
  }

  private publishChatMessageSentEvent(
    userId: string,
    chatId: string,
    chatType: 'user' | 'group' | 'ai',
    messageLength: number,
    isAI: boolean,
  ): void {
    const event = createChatMessageSentEvent({
      userId,
      chatId,
      chatType,
      messageLength,
      isAI,
    });
    this.eventsService.publish(event).catch((err) => {
      this.logger.warn(`Failed to publish chat.message_sent event: ${err.message}`);
    });
  }

  async deleteChat(chatId: string, username: string): Promise<boolean> {
    const result = await this.ChatModel.deleteOne({
      _id: chatId,
      ownerUsername: username,
    }).exec();
    return result.deletedCount > 0;
  }
}

export default ChatService;
