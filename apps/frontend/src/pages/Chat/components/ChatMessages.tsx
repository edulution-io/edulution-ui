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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { Button, cn } from '@edulution-io/ui-kit';
import type ChatMessage from '@libs/chat/types/chatMessage';
import useUserStore from '@/store/UserStore/useUserStore';
import useChatStore from '@/pages/Chat/useChatStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import ChatBubble from './ChatBubble';
import ChatEmptyState from './ChatEmptyState';

interface ChatMessagesProps {
  messages: ChatMessage[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const prevScrollHeightRef = useRef(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const prevMessagesLengthRef = useRef(messages.length);
  const { user } = useUserStore();
  const { isLoading, error, hasMoreMessages, isLoadingOlderMessages, fetchOlderMessages } = useChatStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const sentinel = messagesEndRef.current;
    const container = scrollContainerRef.current;
    if (!sentinel || !container) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        shouldAutoScrollRef.current = entry.isIntersecting;
        setIsAtBottom(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasNewMessages(false);
        }
      },
      { root: container },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [isMounted]);

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current && !shouldAutoScrollRef.current) {
      setHasNewMessages(true);
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  const handleLoadOlder = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      prevScrollHeightRef.current = container.scrollHeight;
    }
    void fetchOlderMessages();
  }, [fetchOlderMessages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setHasNewMessages(false);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return undefined;

    const lastMessage = messages[messages.length - 1];
    const isOwnMessage = lastMessage?.createdBy === user?.username;

    const frameId = requestAnimationFrame(() => {
      if (prevScrollHeightRef.current > 0) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeightRef.current;
        prevScrollHeightRef.current = 0;
      } else if (shouldAutoScrollRef.current || isOwnMessage) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [messages]);

  if (messages.length === 0 && !isLoading && !error) {
    return <ChatEmptyState />;
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="h-full space-y-3 overflow-y-auto p-4 scrollbar-thin"
      >
        {hasMoreMessages && (
          <div className="flex justify-center py-2">
            <Button
              type="button"
              variant="btn-ghost"
              disabled={isLoadingOlderMessages}
              onClick={handleLoadOlder}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {isLoadingOlderMessages ? (
                <CircleLoader
                  height="h-5"
                  width="w-5"
                />
              ) : (
                t('chat.loadOlderMessages')
              )}
            </Button>
          </div>
        )}
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
        <div ref={messagesEndRef} />
      </div>
      {!isAtBottom && (
        <Button
          type="button"
          variant="btn-collaboration"
          size="icon"
          onClick={scrollToBottom}
          className={cn(
            'absolute bottom-4 left-1/2 h-10 w-10 -translate-x-1/2 rounded-full shadow-lg',
            hasNewMessages && 'animate-bounce',
          )}
        >
          <FontAwesomeIcon
            icon={faArrowDown}
            className="h-4 w-4"
          />
        </Button>
      )}
    </div>
  );
};

export default ChatMessages;
