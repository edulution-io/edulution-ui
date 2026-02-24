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
import type ChatRole from '@libs/chat/types/chatRole';
import CHAT_ROLES from '@libs/chat/constants/chatRoles';
import extractTextFromParts from '@libs/chat/utils/extractTextFromParts';
import { AI_CHAT_API_ENDPOINT } from '@libs/chat/constants/chatApiEndpoints';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import useUserStore from '@/store/UserStore/useUserStore';
import useAiChatStore from '@/store/useAiChatStore';
import getAuthHeaders from '@/utils/getAuthHeaders';
import ChatAdapter from '@/pages/Chat/types/chatAdapter';

const TITLE_MAX_LENGTH = 50;
const VALID_CHAT_ROLES = new Set<string>([CHAT_ROLES.USER, CHAT_ROLES.ASSISTANT]);

const useAiChat = (chatId: string): ChatAdapter => {
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const titleSetRef = useRef(false);
  const createdAtMapRef = useRef(new Map<string, string>());
  const updateConversationTitle = useAiChatStore((state) => state.updateConversationTitle);
  const generateConversationTitle = useAiChatStore((state) => state.generateConversationTitle);
  const selectedModelId = useAiChatStore((state) => state.selectedModelId);
  const username = useUserStore((state) => state.user?.username);
  const prevStatusRef = useRef('' as string);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${EDU_API_URL}/${AI_CHAT_API_ENDPOINT}`,
        headers: getAuthHeaders,
        body: () => {
          const { selectedModelId: modelConfigId } = useAiChatStore.getState();
          if (modelConfigId) return { modelConfigId };
          return {};
        },
      }),
    [],
  );

  const { messages: uiMessages, sendMessage, setMessages, status, error } = useChat({ transport, id: chatId });
  const messagesLoadedRef = useRef(false);
  const fetchMessages = useAiChatStore((state) => state.fetchMessages);

  useEffect(() => {
    if (messagesLoadedRef.current) return;
    messagesLoadedRef.current = true;

    void fetchMessages(chatId).then((dbMessages) => {
      if (dbMessages.length === 0) return;

      titleSetRef.current = true;

      const restored: UIMessage[] = [...dbMessages].reverse().map((message) => {
        createdAtMapRef.current.set(message.id, message.createdAt);
        return {
          id: message.id,
          role: message.role as UIMessage['role'],
          parts: [{ type: 'text' as const, text: message.content }],
        };
      });

      setMessages(restored);
    });
  }, [chatId, fetchMessages, setMessages]);

  const messageCacheRef = useRef(new Map<string, ChatMessage>());

  const messages = useMemo<ChatMessage[]>(() => {
    const nextCache = new Map<string, ChatMessage>();
    const result = uiMessages
      .filter((message) => VALID_CHAT_ROLES.has(message.role))
      .map((message) => {
        const textContent = extractTextFromParts(message.parts);
        const filePart = message.parts.find((part) => part.type === 'file');
        const fileName = filePart && 'filename' in filePart ? (filePart.filename as string) : undefined;

        if (!createdAtMapRef.current.has(message.id)) {
          createdAtMapRef.current.set(message.id, new Date().toISOString());
        }

        const cached = messageCacheRef.current.get(message.id);
        if (cached && cached.content === textContent && cached.fileName === fileName) {
          nextCache.set(message.id, cached);
          return cached;
        }

        const chatMessage: ChatMessage = {
          id: message.id,
          role: message.role as ChatRole,
          content: textContent,
          createdAt: createdAtMapRef.current.get(message.id)!,
          createdBy: message.role === CHAT_ROLES.ASSISTANT ? CHAT_ROLES.ASSISTANT : username,
          fileName,
        };
        nextCache.set(message.id, chatMessage);
        return chatMessage;
      });

    messageCacheRef.current = nextCache;
    return result;
  }, [uiMessages, username]);

  useEffect(() => {
    const wasStreaming = prevStatusRef.current === 'streaming';
    prevStatusRef.current = status;

    if (titleSetRef.current) return;
    if (!wasStreaming || status !== 'ready') return;

    const firstUserMessage = uiMessages.find((message) => message.role === CHAT_ROLES.USER);
    if (!firstUserMessage) return;

    const textContent = extractTextFromParts(firstUserMessage.parts);
    if (!textContent.trim()) return;

    titleSetRef.current = true;
    void generateConversationTitle(chatId, selectedModelId ?? undefined).then((title) => {
      if (!title) {
        void updateConversationTitle(chatId, textContent.substring(0, TITLE_MAX_LENGTH));
      }
    });
  }, [status, uiMessages, chatId, generateConversationTitle, updateConversationTitle, selectedModelId]);

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSubmit = useCallback(
    async (e?: FormEvent): Promise<void> => {
      e?.preventDefault();

      if ((!input.trim() && !selectedFile) || isLoading) return;

      const messageContent = input.trim();
      setInput('');

      const dataTransfer = new DataTransfer();
      if (selectedFile) {
        dataTransfer.items.add(selectedFile);
      }
      const files = selectedFile ? dataTransfer.files : undefined;
      setSelectedFile(null);

      await sendMessage({
        text: messageContent || (selectedFile ? selectedFile.name : ''),
        ...(files ? { files } : {}),
      });
    },
    [input, isLoading, selectedFile, sendMessage],
  );

  return {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    error: error ?? null,
    selectedFile,
    setSelectedFile,
  };
};

export default useAiChat;
