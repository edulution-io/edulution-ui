import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import AIChatMessage from '@libs/chat/types/aiChatMessage';
import ChatType from '@libs/chat/types/chatType';
import Chat, { ChatDocument } from './schemas/chat.schema';

@Injectable()
class ChatService {
  constructor(@InjectModel(Chat.name) private ChatModel: Model<ChatDocument>) {}

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
    return chat.save();
  }

  async getAIChats(ownerUsername: string): Promise<ChatDocument[]> {
    return this.ChatModel.find({ ownerUsername, type: ChatType.AI })
      .select('_id title updatedAt aiModel')
      .sort({ updatedAt: -1 })
      .limit(50)
      .exec();
  }

  async saveAIMessages(chatId: string, messages: AIChatMessage[], ownerUsername: string): Promise<ChatDocument | null> {
    const chatMessages = messages.map((msg) => ({
      senderUsername: msg.role === 'user' ? ownerUsername : 'ai-assistant',
      content: msg.content,
      role: msg.role,
      isAI: msg.role === 'assistant',
    }));

    const firstUserMessage = messages.find((m) => m.role === 'user');
    const title = firstUserMessage
      ? `${firstUserMessage.content.slice(0, 50)}${firstUserMessage.content.length > 50 ? '...' : ''}`
      : undefined;

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
    return chat.save();
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
    return chat.save();
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
    return this.ChatModel.findByIdAndUpdate(
      chatId,
      {
        $push: { messages: message },
      },
      { new: true },
    ).exec();
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
