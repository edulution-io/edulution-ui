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

import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ChatMessage from '@libs/ai/types/chatMessage';
import StreamChunk from '@libs/ai/types/streamChunk';

const useChatMessages = () => {
  const { t } = useTranslation();

  const API_URL = import.meta.env.VITE_AI_API_URL as string;
  const API_MODEL = import.meta.env.VITE_AI_MODEL as string;
  const API_KEY = import.meta.env.VITE_AI_API_KEY as string;

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: t('chatBot.messages.welcome') },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedContentRef = useRef<string>('');

  const processStreamLine = useCallback((line: string, assistantMessageId: string) => {
    if (!line.startsWith('data: ')) return;

    const data = line.slice(6);
    if (data === '[DONE]') return;

    const parsed: StreamChunk = JSON.parse(data) as StreamChunk;
    const delta = parsed.choices?.[0]?.delta?.content ?? '';

    if (delta) {
      accumulatedContentRef.current += delta;
      const newContent = accumulatedContentRef.current;

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          id: assistantMessageId,
          role: 'assistant',
          content: newContent,
        };
        return updated;
      });
    }
  }, []);

  const readStream = useCallback(
    async (reader: ReadableStreamDefaultReader<Uint8Array>, assistantMessageId: string) => {
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        // eslint-disable-next-line no-await-in-loop
        const result = await reader.read();
        done = result.done;

        if (result.value) {
          const chunk = decoder.decode(result.value, { stream: true });
          const lines = chunk.split('\n').filter((line) => line.trim() !== '');
          lines.forEach((line) => processStreamLine(line, assistantMessageId));
        }
      }
    },
    [processStreamLine],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isTyping) return;

      const userMessageId = `user-${Date.now()}`;
      const assistantMessageId = `assistant-${Date.now()}`;

      setMessages((prev) => [...prev, { id: userMessageId, role: 'user', content }]);
      setIsTyping(true);
      setMessages((prev) => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

      accumulatedContentRef.current = '';
      abortControllerRef.current = new AbortController();

      try {
        const response = await axios.post<ReadableStream<Uint8Array>>(
          `${API_URL}/v1/chat/completions`,
          {
            model: API_MODEL,
            messages: [...messages.slice(-10), { role: 'user', content }].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            max_tokens: 1024,
            temperature: 0.7,
            stream: true,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${API_KEY}`,
            },
            responseType: 'stream',
            adapter: 'fetch',
            signal: abortControllerRef.current.signal,
          },
        );

        const reader = response.data.getReader();
        await readStream(reader, assistantMessageId);
      } catch (error) {
        console.error('Chat error:', error);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: t('chatBot.messages.error'),
          };
          return updated;
        });
      } finally {
        setIsTyping(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isTyping, API_URL, API_MODEL, API_KEY, t, readStream],
  );

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    stopStreaming,
  };
};

export default useChatMessages;
