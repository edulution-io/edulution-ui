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
import { CHAT_USER_GROUPS_ENDPOINT, getChatMessagesEndpoint } from '@libs/chat/constants/chatApiEndpoints';
import CHAT_MESSAGES_DEFAULT_LIMIT from '@libs/chat/constants/chatMessagesDefaultLimit';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface ChatStore {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  currentConversationType: string | null;
  currentGroupName: string | null;
  userGroups: UserChatGroups | null;
  isLoadingGroups: boolean;
  hasMoreMessages: boolean;
  isLoadingOlderMessages: boolean;

  fetchUserGroups: () => Promise<number>;
  fetchMessages: (conversationType: string, groupName: string, limit?: number, offset?: number) => Promise<void>;
  fetchOlderMessages: () => Promise<void>;
  sendMessage: (conversationType: string, groupName: string, content: string) => Promise<void>;
  setCurrentConversation: (conversationType: string, groupName: string) => void;
  addMessage: (message: ChatMessage) => void;
  reset: () => void;
}

const initialState = {
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  currentConversationType: null,
  currentGroupName: null,
  userGroups: null,
  isLoadingGroups: false,
  hasMoreMessages: false,
  isLoadingOlderMessages: false,
};

const useChatStore = create<ChatStore>((set, get) => ({
  ...initialState,

  fetchUserGroups: async () => {
    if (get().isLoadingGroups) return 0;

    set({ isLoadingGroups: true, error: null });

    try {
      const response = await eduApi.get<UserChatGroups>(CHAT_USER_GROUPS_ENDPOINT);
      set({ userGroups: response.data });
      const { classes, projects, groups } = response.data;
      return classes.length + projects.length + groups.length;
    } catch (error) {
      handleApiError(error, set);
      return 0;
    } finally {
      set({ isLoadingGroups: false });
    }
  },

  fetchMessages: async (conversationType, groupName, limit = CHAT_MESSAGES_DEFAULT_LIMIT, offset = 0) => {
    set({ isLoading: true, error: null });

    try {
      const endpoint = getChatMessagesEndpoint(conversationType, groupName);
      const response = await eduApi.get<ChatMessage[]>(endpoint, {
        params: { limit, offset, sort: 'asc' },
      });

      const { currentConversationType, currentGroupName } = get();
      if (currentConversationType !== conversationType || currentGroupName !== groupName) return;

      set({ messages: response.data, hasMoreMessages: response.data.length === limit });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOlderMessages: async () => {
    const { currentConversationType, currentGroupName, messages, isLoadingOlderMessages } = get();
    if (!currentConversationType || !currentGroupName || isLoadingOlderMessages) return;

    set({ isLoadingOlderMessages: true, error: null });

    try {
      const endpoint = getChatMessagesEndpoint(currentConversationType, currentGroupName);
      const response = await eduApi.get<ChatMessage[]>(endpoint, {
        params: { limit: CHAT_MESSAGES_DEFAULT_LIMIT, offset: messages.length, sort: 'asc' },
      });

      const { currentConversationType: currentType, currentGroupName: currentName } = get();
      if (currentType !== currentConversationType || currentName !== currentGroupName) return;

      set((state) => ({
        messages: [...response.data, ...state.messages],
        hasMoreMessages: response.data.length === CHAT_MESSAGES_DEFAULT_LIMIT,
      }));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoadingOlderMessages: false });
    }
  },

  sendMessage: async (conversationType, groupName, content) => {
    set({ isSending: true, error: null });

    try {
      const endpoint = getChatMessagesEndpoint(conversationType, groupName);
      const response = await eduApi.post<ChatMessage>(endpoint, { content });

      const newMessage = response.data;

      const { currentConversationType, currentGroupName } = get();
      if (currentConversationType !== conversationType || currentGroupName !== groupName) return;

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isSending: false });
    }
  },

  setCurrentConversation: (conversationType, groupName) => {
    const { currentConversationType, currentGroupName } = get();

    if (currentConversationType !== conversationType || currentGroupName !== groupName) {
      set({
        currentConversationType: conversationType,
        currentGroupName: groupName,
        messages: [],
        hasMoreMessages: false,
        isLoadingOlderMessages: false,
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
