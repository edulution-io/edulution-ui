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

import { create } from 'zustand';
import ChatMessageData from '@libs/chat/types/chatMessageData';
import AIChatMessage from '@libs/chat/types/aiChatMessage';
import AIModelConfig from '@libs/chat/types/aiModelConfig';
import {
  CHAT_AI_CHATS_ENDPOINT,
  CHAT_AI_CONFIG_ENDPOINT,
  CHAT_AI_ENDPOINT,
  CHAT_AI_STREAM_ENDPOINT,
  CHAT_ENDPOINT,
} from '@libs/chat/constants/chatEndpoints';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import ChatMessageRole from '@libs/chat/constants/chatMessageRole';
import { HTTP_HEADERS, HttpMethods, RequestResponseContentType } from '@libs/common/types/http-methods';
import processStreamChunks from '@libs/chat/utils/processStreamChunks';
import ChatSummary from '@libs/chat/types/chatSummary';
import getRandomUUID from '@/utils/getRandomUUID';

interface UseAIChatStore {
  messages: ChatMessageData[];
  currentChatId: string | null;
  chatList: ChatSummary[];
  isChatListLoading: boolean;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  abortController: AbortController | null;
  aiConfig: AIModelConfig | null;
  availableModels: AIModelConfig[];
  isConfigLoading: boolean;
  createChat: () => Promise<string>;
  loadChat: (chatId: string) => Promise<void>;
  loadChatList: () => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  setCurrentChatId: (chatId: string | null) => void;
  setMessages: (messages: ChatMessageData[]) => void;
  addMessage: (message: ChatMessageData) => void;
  updateMessage: (id: string, updates: Partial<ChatMessageData>) => void;
  removeMessage: (id: string) => void;
  sendMessage: (
    text: string,
    user: { cn: string; displayName?: string; givenName?: string; sn?: string },
  ) => Promise<void>;
  stopGeneration: () => void;
  clearMessages: () => void;
  fetchAIConfig: () => Promise<void>;
  setActiveModel: (model: AIModelConfig) => void;
  reset: () => void;
}

const initialState = {
  currentChatId: null,
  chatList: [],
  isChatListLoading: false,
  messages: [],
  isLoading: false,
  isError: false,
  error: null,
  abortController: null,
  aiConfig: null,
  availableModels: [],
  isConfigLoading: false,
};

const useAIChatStore = create<UseAIChatStore>((set, get) => ({
  ...initialState,

  setMessages: (messages) => set({ messages }),

  addMessage: (message) => set({ messages: [...get().messages, message] }),

  updateMessage: (id, updates) =>
    set({
      messages: get().messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
    }),

  removeMessage: (id) =>
    set({
      messages: get().messages.filter((msg) => msg.id !== id),
    }),

  stopGeneration: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ abortController: null, isLoading: false });
    }
  },

  clearMessages: () => set({ messages: [], error: null, isError: false, currentChatId: null }),

  reset: () => set(initialState),

  fetchAIConfig: async () => {
    if (get().isConfigLoading) return;

    set({ isConfigLoading: true });

    try {
      const { data } = await eduApi.get<{
        current: AIModelConfig;
        available: AIModelConfig[];
      }>(`${CHAT_AI_ENDPOINT}/${CHAT_AI_CONFIG_ENDPOINT}`);

      set({
        aiConfig: data.current,
        availableModels: data.available,
      });
    } catch (err) {
      handleApiError(err, set);
    } finally {
      set({ isConfigLoading: false });
    }
  },

  setActiveModel: (model) => {
    set({
      aiConfig: {
        provider: model.provider,
        model: model.model,
        label: model.label,
      },
    });
  },

  sendMessage: async (text, user) => {
    if (!text.trim() || get().isLoading) return;

    let { currentChatId } = get();
    if (!currentChatId) {
      currentChatId = await get().createChat();
    }

    const userMessage: ChatMessageData = {
      id: getRandomUUID(),
      text,
      sender: {
        cn: user.cn || 'unknown',
        displayName: user.displayName,
        firstName: user.givenName,
        lastName: user.sn,
      },
      timestamp: new Date().toISOString(),
      isOwn: true,
      role: ChatMessageRole.USER,
    };

    const aiMessageId = (Date.now() + 1).toString();
    const { aiConfig } = get();
    const aiMessage: ChatMessageData = {
      id: aiMessageId,
      text: '',
      sender: {
        cn: ChatMessageRole.ASSISTANT,
        displayName: aiConfig?.label,
        isAI: true,
      },
      timestamp: new Date().toISOString(),
      isOwn: false,
      role: ChatMessageRole.ASSISTANT,
      isStreaming: true,
    };

    const abortController = new AbortController();

    set({
      messages: [...get().messages, userMessage, aiMessage],
      isLoading: true,
      isError: false,
      error: null,
      abortController,
    });

    try {
      const apiMessages: AIChatMessage[] = get()
        .messages.slice(0, -1)
        .map((msg) => ({
          role: msg.role || (msg.isOwn ? ChatMessageRole.USER : ChatMessageRole.ASSISTANT),
          content: msg.text,
        }));

      const response = await fetch(`${eduApi.defaults.baseURL}/${CHAT_AI_ENDPOINT}/${CHAT_AI_STREAM_ENDPOINT}`, {
        method: HttpMethods.POST,
        headers: {
          [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_JSON,
          Authorization: (eduApi.defaults.headers.common?.Authorization as string) || '',
        },
        body: JSON.stringify({ messages: apiMessages, chatId: currentChatId }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        return;
      }

      const reader = response.body?.getReader();

      if (!reader) {
        return;
      }

      const decoder = new TextDecoder();

      await processStreamChunks(reader, decoder, (fullText) => {
        get().updateMessage(aiMessageId, { text: fullText });
      });

      get().updateMessage(aiMessageId, { isStreaming: false });
      void get().loadChatList();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        get().updateMessage(aiMessageId, { isStreaming: false });
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        set({ isError: true, error: errorMessage });
        get().removeMessage(aiMessageId);
        handleApiError(err, set);
      }
    } finally {
      set({ isLoading: false, abortController: null });
    }
  },

  createChat: async () => {
    try {
      const { data } = await eduApi.post<{ id: string }>(`${CHAT_ENDPOINT}/${CHAT_AI_CHATS_ENDPOINT}`);
      set({ currentChatId: data.id });
      void get().loadChatList();
      return data.id;
    } catch (err) {
      handleApiError(err, set);
      throw err;
    }
  },

  loadChat: async (chatId: string) => {
    try {
      const { data } = await eduApi.get<{
        id: string;
        title: string;
        messages: AIChatMessage[];
      }>(`${CHAT_ENDPOINT}/${CHAT_AI_CHATS_ENDPOINT}/${chatId}`);

      const { aiConfig } = get();

      const messages: ChatMessageData[] = data.messages.map((msg, index) => ({
        id: `${chatId}-${index}`,
        text: msg.content || '',
        sender: {
          cn: msg.role === ChatMessageRole.USER ? ChatMessageRole.USER : ChatMessageRole.ASSISTANT,
          displayName: msg.role === ChatMessageRole.ASSISTANT ? aiConfig?.label : undefined,
          isAI: msg.role === ChatMessageRole.ASSISTANT,
        },
        timestamp: new Date().toISOString(),
        isOwn: msg.role === ChatMessageRole.USER,
        role: msg.role,
      }));

      set({ currentChatId: chatId, messages });
    } catch (err) {
      handleApiError(err, set);
    }
  },

  loadChatList: async () => {
    if (get().isChatListLoading) return;

    set({ isChatListLoading: true });

    try {
      const { data } = await eduApi.get<ChatSummary[]>(`${CHAT_ENDPOINT}/${CHAT_AI_CHATS_ENDPOINT}`);
      set({ chatList: data });
    } catch (err) {
      handleApiError(err, set);
    } finally {
      set({ isChatListLoading: false });
    }
  },

  deleteChat: async (chatId: string) => {
    try {
      await eduApi.delete(`${CHAT_ENDPOINT}/${CHAT_AI_CHATS_ENDPOINT}/${chatId}`);
      const { currentChatId } = get();
      set((state) => ({
        chatList: state.chatList.filter((c) => c.id !== chatId),
        currentChatId: currentChatId === chatId ? null : currentChatId,
        messages: currentChatId === chatId ? [] : state.messages,
      }));
    } catch (err) {
      handleApiError(err, set);
    }
  },

  setCurrentChatId: (chatId) => set({ currentChatId: chatId }),
}));

export default useAIChatStore;
