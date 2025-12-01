/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, useRef } from 'react';
import ChatBubble from '@/pages/ChatBot/components/ChatBubble';
import ChatTypingIndicator from '@/pages/ChatBot/components/ChatTypingIndicator';
import ChatMessage from '@libs/ai/types/chatMessage';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

const ChatMessageList = ({ messages, isTyping }: ChatMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
      {messages.map((message) =>
        message.content ? (
          <ChatBubble
            key={message.id}
            content={message.content}
            isUser={message.role === 'user'}
          />
        ) : null,
      )}

      {isTyping && <ChatTypingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
