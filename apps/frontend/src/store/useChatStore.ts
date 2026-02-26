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
import ChatMessage from '@libs/chat/types/chatMessage';
import UserChatGroups from '@libs/chat/types/userChatGroups';
import { CHAT_USER_GROUPS_ENDPOINT, CHAT_CONVERSATIONS_ENDPOINT } from '@libs/chat/constants/chatApiEndpoints';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface ChatStore {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  currentSophomorixType: string | null;
  currentGroupName: string | null;
  userGroups: UserChatGroups | null;
  isLoadingGroups: boolean;

  fetchUserGroups: () => Promise<void>;
  fetchMessages: (sophomorixType: string, groupName: string, limit?: number, offset?: number) => Promise<void>;
  sendMessage: (sophomorixType: string, groupName: string, content: string) => Promise<ChatMessage | null>;
  setCurrentConversation: (sophomorixType: string, groupName: string) => void;
  addMessage: (message: ChatMessage) => void;
  reset: () => void;
}

const DEFAULT_LIMIT = 50;

const initialState = {
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  currentSophomorixType: null,
  currentGroupName: null,
  userGroups: null,
  isLoadingGroups: false,
};

const useChatStore = create<ChatStore>((set, get) => ({
  ...initialState,

  fetchUserGroups: async () => {
    if (get().isLoadingGroups) return;

    set({ isLoadingGroups: true, error: null });

    try {
      const response = await eduApi.get<UserChatGroups>(CHAT_USER_GROUPS_ENDPOINT);
      set({ userGroups: response.data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoadingGroups: false });
    }
  },

  fetchMessages: async (sophomorixType, groupName, limit = DEFAULT_LIMIT, offset = 0) => {
    set({ isLoading: true, error: null });

    try {
      const endpoint = `${CHAT_CONVERSATIONS_ENDPOINT}/${sophomorixType}/${encodeURIComponent(groupName)}/messages`;
      const response = await eduApi.get<ChatMessage[]>(endpoint, {
        params: { limit, offset },
      });

      const { currentSophomorixType, currentGroupName } = get();
      if (currentSophomorixType !== sophomorixType || currentGroupName !== groupName) return;

      const messages = [...response.data].reverse();

      set({ messages });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (sophomorixType, groupName, content) => {
    set({ isSending: true, error: null });

    try {
      const endpoint = `${CHAT_CONVERSATIONS_ENDPOINT}/${sophomorixType}/${encodeURIComponent(groupName)}/messages`;
      const response = await eduApi.post<ChatMessage>(endpoint, { content });

      const newMessage = response.data;

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));

      return newMessage;
    } catch (error) {
      handleApiError(error, set);
      return null;
    } finally {
      set({ isSending: false });
    }
  },

  setCurrentConversation: (sophomorixType, groupName) => {
    const { currentSophomorixType, currentGroupName } = get();

    if (currentSophomorixType !== sophomorixType || currentGroupName !== groupName) {
      set({
        currentSophomorixType: sophomorixType,
        currentGroupName: groupName,
        messages: [],
      });
    }
  },

  addMessage: (message) => {
    set((state) => {
      const exists = state.messages.some((m) => m.id === message.id);
      if (exists) return state;
      return { messages: [...state.messages, message] };
    });
  },

  reset: () => set(initialState),
}));

export default useChatStore;
