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

import { useState, useCallback, useMemo, useEffect, useRef, FormEvent } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';
import type ChatMessage from '@libs/chat/types/chatMessage';
import CHAT_ROLES from '@libs/chat/constants/chatRoles';
import { AI_CHAT_API_ENDPOINT } from '@libs/chat/constants/chatApiEndpoints';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import useUserStore from '@/store/UserStore/useUserStore';
import useAiChatStore from '@/store/useAiChatStore';
import getAuthHeaders from '@/utils/getAuthHeaders';
import ChatAdapter from '@/pages/Chat/types/chatAdapter';

const TITLE_MAX_LENGTH = 50;

const useAiChat = (chatId: string): ChatAdapter => {
  const [input, setInput] = useState('');
  const titleSetRef = useRef(false);
  const { updateConversationTitle, config } = useAiChatStore();
  const username = useUserStore((state) => state.user?.username);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${EDU_API_URL}/${AI_CHAT_API_ENDPOINT}`,
        headers: getAuthHeaders,
        body: () => {
          const { selectedAssistantId: assistantId } = useAiChatStore.getState();
          if (assistantId) {
            return { assistantId };
          }
          return {};
        },
      }),
    [],
  );

  const { messages: uiMessages, sendMessage, setMessages, status, error } = useChat({ transport, id: chatId });
  const messagesLoadedRef = useRef(false);
  const { fetchMessages } = useAiChatStore();

  useEffect(() => {
    if (messagesLoadedRef.current) return;
    messagesLoadedRef.current = true;

    void fetchMessages(chatId).then((dbMessages) => {
      if (dbMessages.length === 0) return;

      titleSetRef.current = true;

      const restored: UIMessage[] = dbMessages.reverse().map((msg) => ({
        id: msg.id,
        role: msg.role as UIMessage['role'],
        parts: [{ type: 'text' as const, text: msg.content }],
      }));

      setMessages(restored);
    });
  }, [chatId, fetchMessages, setMessages]);

  const messages = useMemo<ChatMessage[]>(
    () =>
      uiMessages.map((msg) => {
        const textContent = msg.parts
          .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
          .map((part) => part.text)
          .join('');

        const isAssistant = msg.role === CHAT_ROLES.ASSISTANT;

        return {
          id: msg.id,
          role: msg.role as ChatMessage['role'],
          content: textContent,
          createdAt: new Date().toISOString(),
          createdBy: isAssistant ? CHAT_ROLES.ASSISTANT : username,
          createdByUserFirstName: isAssistant ? config?.assistantFirstName : undefined,
          createdByUserLastName: isAssistant ? config?.assistantLastName : undefined,
        };
      }),
    [uiMessages, username, config],
  );

  useEffect(() => {
    if (titleSetRef.current) return;
    const firstUserMessage = uiMessages.find((msg) => msg.role === CHAT_ROLES.USER);
    if (!firstUserMessage) return;

    const textContent = firstUserMessage.parts
      .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
      .map((part) => part.text)
      .join('');

    if (textContent.trim()) {
      void updateConversationTitle(chatId, textContent.substring(0, TITLE_MAX_LENGTH));
      titleSetRef.current = true;
    }
  }, [uiMessages, chatId, updateConversationTitle]);

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSubmit = useCallback(
    async (e?: FormEvent): Promise<void> => {
      e?.preventDefault();

      if (!input.trim() || isLoading) return;

      const messageContent = input.trim();
      setInput('');

      await sendMessage({ text: messageContent });
    },
    [input, isLoading, sendMessage],
  );

  return {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    error: error ?? null,
  };
};

export default useAiChat;
