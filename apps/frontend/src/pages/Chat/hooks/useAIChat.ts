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

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Chat, useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';
import { CHAT_AI_ENDPOINT, CHAT_AI_STREAM_ENDPOINT } from '@libs/chat/constants/chatEndpoints';
import CHAT_STATUS from '@libs/chat/constants/chatStatus';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import ChatMessageData from '@libs/chat/types/chatMessageData';
import ChatMessageSender from '@libs/chat/types/chatMessageSender';
import eduApi from '@/api/eduApi';
import useUserStore from '@/store/UserStore/useUserStore';
import uiMessageToChatMessage from '@libs/mcp/utils/uiMessageToChatMessage';
import chatMessageToUIMessage from '@libs/mcp/utils/chatMessageToUIMessage';
import useAIChatStore from './useAIChatStore';

interface UseAIChatOptions {
  enabledTools?: string[];
}

const useAIChat = (options: UseAIChatOptions = {}) => {
  const { enabledTools = [] } = options;
  const { user } = useUserStore();
  const pendingChatIdRef = useRef<string | null>(null);

  const {
    currentChatId,
    chatList,
    isChatListLoading,
    aiConfig,
    availableModels,
    isConfigLoading,
    createChat,
    loadChat,
    loadChatList,
    deleteChat,
    setCurrentChatId,
    fetchAIConfig,
    setActiveModel,
  } = useAIChatStore();

  const loadedMessages = useAIChatStore((state) => state.messages);
  const storeCurrentChatId = useAIChatStore((state) => state.currentChatId);

  const userInfo: ChatMessageSender = useMemo(
    () => ({
      cn: user?.username || '',
      displayName: user?.username,
      firstName: user?.firstName,
      lastName: user?.lastName,
      isAI: false,
    }),
    [user?.username, user?.firstName, user?.lastName],
  );

  const transport = useMemo(() => {
    const getAuthHeader = () => (eduApi.defaults.headers.Authorization as string) || '';

    return new DefaultChatTransport({
      api: `${EDU_API_URL}/${CHAT_AI_ENDPOINT}/${CHAT_AI_STREAM_ENDPOINT}`,
      headers: () => ({
        Authorization: getAuthHeader(),
      }),
      body: () => ({
        chatId: pendingChatIdRef.current ?? useAIChatStore.getState().currentChatId,
        enabledTools,
      }),
    });
  }, [enabledTools]);

  const chat = useMemo(() => new Chat({ transport }), [transport]);

  const { messages, sendMessage, stop, status, error, setMessages } = useChat({ chat });

  const isLoading = status === CHAT_STATUS.SUBMITTED || status === CHAT_STATUS.STREAMING;
  const isStreaming = status === CHAT_STATUS.STREAMING;

  const chatMessages: ChatMessageData[] = useMemo(
    () => messages.map((msg) => uiMessageToChatMessage(msg, aiConfig?.label, userInfo)),
    [messages, aiConfig?.label, userInfo],
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      let chatId = useAIChatStore.getState().currentChatId;

      if (!chatId) {
        chatId = await createChat();
        pendingChatIdRef.current = chatId;
      }

      await sendMessage({ text });
      pendingChatIdRef.current = null;
      void loadChatList();
    },
    [isLoading, createChat, sendMessage, loadChatList],
  );

  const handleLoadChat = useCallback(
    async (chatId: string) => {
      setCurrentChatId(chatId);
      setMessages([]);
      await loadChat(chatId);
    },
    [setCurrentChatId, setMessages, loadChat],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentChatId(null);
  }, [setMessages, setCurrentChatId]);

  useEffect(() => {
    if (storeCurrentChatId === null) {
      setMessages([]);
    }
  }, [storeCurrentChatId, setMessages]);

  useEffect(() => {
    if (loadedMessages.length > 0) {
      const uiMessages: UIMessage[] = loadedMessages.map(chatMessageToUIMessage);
      setMessages(uiMessages);
    }
  }, [loadedMessages, setMessages]);

  useEffect(() => {
    if (!aiConfig && !isConfigLoading) {
      void fetchAIConfig();
    }
  }, [aiConfig, isConfigLoading, fetchAIConfig]);

  return {
    messages: chatMessages,
    rawMessages: messages,
    isLoading,
    isStreaming,
    isError: !!error,
    error: error?.message || null,
    status,
    currentChatId,
    chatList,
    isChatListLoading,
    aiConfig,
    availableModels,
    isConfigLoading,
    sendMessage: handleSendMessage,
    stopGeneration: stop,
    clearMessages,
    createChat,
    loadChat: handleLoadChat,
    loadChatList,
    deleteChat,
    setCurrentChatId,
    fetchAIConfig,
    setActiveModel,
  };
};

export default useAIChat;
