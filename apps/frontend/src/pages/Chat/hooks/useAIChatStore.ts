/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 */

import { create } from 'zustand';
import ChatMessageData from '@libs/chat/types/chatMessageData';
import AIChatMessage from '@libs/chat/types/aiChatMessage';
import AIModelConfig from '@libs/chat/types/aiModelConfig';
import { CHAT_AI_CONFIG_ENDPOINT, CHAT_AI_ENDPOINT, CHAT_AI_STREAM_ENDPOINT } from '@libs/chat/constants/chatEndpoints';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import ChatMessageRole from '@libs/chat/constants/chatMessageRole';
import { HTTP_HEADERS, HttpMethods, RequestResponseContentType } from '@libs/common/types/http-methods';
import processStreamChunks from '@libs/chat/utils/processStreamChunks';

interface UseAIChatStore {
  messages: ChatMessageData[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  abortController: AbortController | null;
  aiConfig: AIModelConfig | null;
  availableModels: AIModelConfig[];
  isConfigLoading: boolean;
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

  clearMessages: () => set({ messages: [], error: null, isError: false }),

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

    const userMessage: ChatMessageData = {
      id: Date.now().toString(),
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
        cn: 'ai-assistant',
        displayName: aiConfig?.label || 'KI-Assistent',
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
        body: JSON.stringify({ messages: apiMessages }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        return;
      }

      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();

      await processStreamChunks(reader, decoder, (fullText) => {
        get().updateMessage(aiMessageId, { text: fullText });
      });

      get().updateMessage(aiMessageId, { isStreaming: false });
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
}));

export default useAIChatStore;
