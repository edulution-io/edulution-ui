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
import AiConversation from '@libs/chat/types/aiConversation';
import AiChatMessageResponse from '@libs/chat/types/aiChatMessageResponse';
import AiChatModelUserDto from '@libs/aiChatModel/types/aiChatModelUserDto';
import {
  AI_CHAT_CONVERSATIONS_ENDPOINT,
  AI_CHAT_MODELS_ENDPOINT,
  getAiChatMessagesEndpoint,
} from '@libs/chat/constants/chatApiEndpoints';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface AiChatStore {
  conversations: AiConversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  availableModels: AiChatModelUserDto[];
  selectedModelId: string | null;
  fetchConversations: () => Promise<void>;
  createConversation: (title: string) => Promise<string | null>;
  deleteConversation: (id: string) => Promise<void>;
  setActiveConversation: (id: string | null) => void;
  updateConversationTitle: (id: string, title: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<AiChatMessageResponse[]>;
  fetchAvailableModels: () => Promise<void>;
  setSelectedModelId: (id: string | null) => void;
}

const useAiChatStore = create<AiChatStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  isLoading: false,
  error: null,
  availableModels: [],
  selectedModelId: null,

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<AiConversation[]>(AI_CHAT_CONVERSATIONS_ENDPOINT);
      set({ conversations: response.data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  createConversation: async (title) => {
    try {
      const response = await eduApi.post<AiConversation>(AI_CHAT_CONVERSATIONS_ENDPOINT, {
        title,
      });
      const conversation = response.data;
      set((state) => ({
        conversations: [conversation, ...state.conversations],
        activeConversationId: conversation.id,
      }));
      return conversation.id;
    } catch (error) {
      handleApiError(error, set);
      return null;
    }
  },

  deleteConversation: async (id) => {
    try {
      await eduApi.delete(`${AI_CHAT_CONVERSATIONS_ENDPOINT}/${id}`);
      set((state) => {
        const filtered = state.conversations.filter((conversation) => conversation.id !== id);
        const isActive = state.activeConversationId === id;
        return {
          conversations: filtered,
          activeConversationId: isActive ? null : state.activeConversationId,
        };
      });
    } catch (error) {
      handleApiError(error, set);
    }
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id });
  },

  fetchMessages: async (conversationId) => {
    try {
      const response = await eduApi.get<AiChatMessageResponse[]>(getAiChatMessagesEndpoint(conversationId));
      return response.data;
    } catch (error) {
      handleApiError(error, set);
      return [];
    }
  },

  updateConversationTitle: async (id, title) => {
    try {
      await eduApi.patch(`${AI_CHAT_CONVERSATIONS_ENDPOINT}/${id}`, { title });
      set((state) => ({
        conversations: state.conversations.map((conversation) =>
          conversation.id === id ? { ...conversation, title } : conversation,
        ),
      }));
    } catch (error) {
      handleApiError(error, set);
    }
  },

  fetchAvailableModels: async () => {
    try {
      const response = await eduApi.get<AiChatModelUserDto[]>(AI_CHAT_MODELS_ENDPOINT);
      const models = response.data;
      const currentSelectedId = get().selectedModelId;
      const isCurrentStillAvailable = models.some((model) => model.id === currentSelectedId);
      const selectedModelId = isCurrentStillAvailable ? currentSelectedId : (models[0]?.id ?? null);
      set({ availableModels: models, selectedModelId });
    } catch (error) {
      handleApiError(error, set);
    }
  },

  setSelectedModelId: (id) => set({ selectedModelId: id }),
}));

export default useAiChatStore;
