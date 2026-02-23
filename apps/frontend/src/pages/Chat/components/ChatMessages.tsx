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

import React, { useEffect, useRef } from 'react';
import type ChatMessage from '@libs/chat/types/chatMessage';
import useUserStore from '@/store/UserStore/useUserStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import ChatBubble from './ChatBubble';
import ChatEmptyState from './ChatEmptyState';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevIsLoadingRef = useRef(false);
  const prevMessageCountRef = useRef(0);
  const { user } = useUserStore();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wasLoading = prevIsLoadingRef.current;
    const prevCount = prevMessageCountRef.current;
    prevIsLoadingRef.current = isLoading;
    prevMessageCountRef.current = messages.length;

    const streamingFinished = wasLoading && !isLoading;
    const newMessageAdded = messages.length > prevCount && !isLoading;

    if (streamingFinished || newMessageAdded) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return <ChatEmptyState />;
  }

  return (
    <div
      ref={containerRef}
      className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin"
    >
      {messages.map((message) => (
        <ChatBubble
          key={message.id}
          message={message}
          isOwnMessage={message.createdBy === user?.username}
        />
      ))}
      {isLoading && (
        <div className="flex justify-center py-4">
          <CircleLoader />
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
