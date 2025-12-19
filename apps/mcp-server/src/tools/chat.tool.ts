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
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import BaseTool from './base.tool';

interface Chat {
  id: string;
  name?: string;
  type?: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface ChatMessage {
  id: string;
  content: string;
  sender?: string;
  createdAt?: string;
}

interface ChatWithMessages extends Chat {
  messages?: ChatMessage[];
}

@Injectable()
class ChatTool extends BaseTool {
  @Tool({
    name: 'chat_ai_list',
    description: 'List all AI chat conversations for the current user',
    parameters: z.object({}),
  })
  async listAiChats() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi<Chat[]>('/chat/ai-chats');

      if (!result || result.length === 0) {
        return {
          content: [{ type: 'text', text: 'No AI chats found.' }],
        };
      }

      const formatted = result.map((c) => `- ${c.name || 'Untitled'} (ID: ${c.id})`).join('\n');
      return {
        content: [{ type: 'text', text: `Found ${result.length} AI chat(s):\n\n${formatted}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'chat_ai_create',
    description: 'Create a new AI chat conversation. Call ONCE - do NOT repeat after success.',
    parameters: z.object({}),
  })
  async createAiChat() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi<Chat>('/chat/ai-chats', { method: 'POST' });

      return {
        content: [
          {
            type: 'text',
            text: `CREATED: AI Chat\nID: ${result.id}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to create AI chat: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'chat_ai_delete',
    description: 'Delete an AI chat conversation. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      chatId: z.string().describe('The ID of the AI chat to delete'),
    }),
  })
  async deleteAiChat(params: { chatId: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      await this.callApi(`/chat/ai-chats/${params.chatId}`, { method: 'DELETE' });

      return {
        content: [
          {
            type: 'text',
            text: `DELETED: AI Chat ${params.chatId}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to delete AI chat: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'chat_user_list',
    description: 'List all direct message chats with other users',
    parameters: z.object({}),
  })
  async listUserChats() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi<Chat[]>('/chat/users');

      if (!result || result.length === 0) {
        return {
          content: [{ type: 'text', text: 'No direct message chats found.' }],
        };
      }

      const formatted = result
        .map((c) => {
          const unread = c.unreadCount ? ` (${c.unreadCount} unread)` : '';
          return `- ${c.name || 'Unknown'} (ID: ${c.id})${unread}`;
        })
        .join('\n');

      return {
        content: [{ type: 'text', text: `Found ${result.length} user chat(s):\n\n${formatted}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'chat_user_create',
    description: 'Create or get a direct message chat with another user. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      targetUsername: z.string().describe('Username of the person to chat with'),
    }),
  })
  async createUserChat(params: { targetUsername: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi<Chat>(`/chat/users/${params.targetUsername}`, { method: 'POST' });

      return {
        content: [
          {
            type: 'text',
            text: `CREATED/FOUND: Chat with ${params.targetUsername}\nChat ID: ${result.id}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to create user chat: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'chat_group_list',
    description: 'List all group chats',
    parameters: z.object({}),
  })
  async listGroupChats() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi<Chat[]>('/chat/groups');

      if (!result || result.length === 0) {
        return {
          content: [{ type: 'text', text: 'No group chats found.' }],
        };
      }

      const formatted = result.map((c) => `- ${c.name || 'Unknown'} (ID: ${c.id})`).join('\n');
      return {
        content: [{ type: 'text', text: `Found ${result.length} group chat(s):\n\n${formatted}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'chat_group_create',
    description: 'Create or get a group chat. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      groupCn: z.string().describe('The common name (CN) of the group'),
      groupName: z.string().optional().describe('Optional display name for the group chat'),
    }),
  })
  async createGroupChat(params: { groupCn: string; groupName?: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const body: Record<string, unknown> = {};
      if (params.groupName) body.groupName = params.groupName;

      const result = await this.callApi<Chat>(`/chat/groups/${params.groupCn}`, {
        method: 'POST',
        data: Object.keys(body).length > 0 ? body : undefined,
      });

      return {
        content: [
          {
            type: 'text',
            text: `CREATED/FOUND: Group chat "${params.groupName || params.groupCn}"\nChat ID: ${result.id}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to create group chat: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'chat_get',
    description: 'Get a specific chat with all messages',
    parameters: z.object({
      chatId: z.string().describe('The ID of the chat to retrieve'),
    }),
  })
  async getChat(params: { chatId: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi<ChatWithMessages>(`/chat/chats/${params.chatId}`);

      let output = `Chat: ${result.name || 'Untitled'} (ID: ${result.id})\n`;
      if (result.messages && result.messages.length > 0) {
        const recentMessages = result.messages.slice(-10);
        const messageLines = recentMessages.map((msg) => {
          const sender = msg.sender || 'Unknown';
          const preview = msg.content.length > 100 ? `${msg.content.substring(0, 100)}...` : msg.content;
          return `- [${sender}]: ${preview}`;
        });
        output += `\nMessages (${result.messages.length}):\n${messageLines.join('\n')}\n`;
        if (result.messages.length > 10) {
          output += `\n... and ${result.messages.length - 10} earlier messages`;
        }
      } else {
        output += '\nNo messages yet.';
      }

      return {
        content: [{ type: 'text', text: output }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'chat_send_message',
    description: 'Send a message to a chat. Call ONCE per message - do NOT repeat after success.',
    parameters: z.object({
      chatId: z.string().describe('The ID of the chat'),
      content: z.string().describe('The message content to send'),
    }),
  })
  async sendMessage(params: { chatId: string; content: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      await this.callApi(`/chat/chats/${params.chatId}/messages`, {
        method: 'POST',
        data: { content: params.content },
      });

      const preview = params.content.length > 50 ? `${params.content.substring(0, 50)}...` : params.content;
      return {
        content: [
          {
            type: 'text',
            text: `SENT: Message to chat ${params.chatId}\nContent: "${preview}"\n\nMessage sent. Do NOT call again for this message.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to send message: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }
}

export default ChatTool;
