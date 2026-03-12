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
import ChatMessageSsePayload from '@libs/chat/types/chatMessageSsePayload';
import UserChatGroups from '@libs/chat/types/userChatGroups';
import { CHAT_USER_GROUPS_ENDPOINT, getChatMessagesEndpoint } from '@libs/chat/constants/chatApiEndpoints';
import CHAT_MESSAGES_DEFAULT_LIMIT from '@libs/chat/constants/chatMessagesDefaultLimit';
import { SORT_DIRECTION } from '@libs/common/constants/sortDirection';
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
  addMessage: (message: ChatMessageSsePayload) => void;
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

let fetchMessagesAbortController: AbortController | null = null;

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
    fetchMessagesAbortController?.abort();
    fetchMessagesAbortController = new AbortController();

    set({ isLoading: true, error: null });

    try {
      const endpoint = getChatMessagesEndpoint(conversationType, groupName);
      const response = await eduApi.get<ChatMessage[]>(endpoint, {
        params: { limit: limit + 1, offset, sort: SORT_DIRECTION.ASC },
        signal: fetchMessagesAbortController.signal,
      });

      const { currentConversationType, currentGroupName } = get();
      if (currentConversationType !== conversationType || currentGroupName !== groupName) return;

      const hasMore = response.data.length > limit;
      set({ messages: hasMore ? response.data.slice(0, limit) : response.data, hasMoreMessages: hasMore });
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
        params: { limit: CHAT_MESSAGES_DEFAULT_LIMIT + 1, offset: messages.length, sort: SORT_DIRECTION.ASC },
      });

      const { currentConversationType: currentType, currentGroupName: currentName } = get();
      if (currentType !== currentConversationType || currentName !== currentGroupName) return;

      const hasMore = response.data.length > CHAT_MESSAGES_DEFAULT_LIMIT;
      const olderMessages = hasMore ? response.data.slice(0, CHAT_MESSAGES_DEFAULT_LIMIT) : response.data;
      set((state) => ({
        messages: [...olderMessages, ...state.messages],
        hasMoreMessages: hasMore,
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

      const { currentConversationType, currentGroupName } = get();
      if (currentConversationType !== conversationType || currentGroupName !== groupName) return;

      set((state) => ({
        messages: [...state.messages, response.data],
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
    const { currentConversationType, currentGroupName } = get();
    if (message.conversationType !== currentConversationType || message.groupName !== currentGroupName) return;

    set((state) => {
      const exists = state.messages.some((msg) => msg.id === message.id);
      if (exists) return state;
      return { messages: [...state.messages, message] };
    });
  },

  reset: () => set(initialState),
}));

export default useChatStore;
