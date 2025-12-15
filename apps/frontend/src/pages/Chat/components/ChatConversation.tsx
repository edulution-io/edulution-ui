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

import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAIChat from '@/pages/Chat/hooks/useAIChat';
import useAIChatRouting from '@/pages/Chat/hooks/useAIChatRouting';
import useChatStore from '@/pages/Chat/hooks/useChatStore';
import useMcpTools from '@/pages/Chat/hooks/useMcpTools';
import { ChatTypeValue } from '@libs/chat/types/chatTypeValue';
import ChatType from '@libs/chat/types/chatType';
import ChatInput from './ChatInput';
import ChatMessageList from './ChatMessageList';

interface ChatConversationProps {
  isPopout?: boolean;
}

const ChatConversation: React.FC<ChatConversationProps> = ({ isPopout = false }) => {
  const { t } = useTranslation();
  const { type } = useParams<{ type: ChatTypeValue }>();
  const { currentlyOpenChat } = useChatStore();
  const { enabledTools } = useMcpTools();

  const chatType = isPopout ? currentlyOpenChat?.type : type;
  const isAIChat = chatType === ChatType.AI;

  useAIChatRouting({ enabled: isAIChat });

  const { messages, isLoading, isError, sendMessage, stopGeneration } = useAIChat({ enabledTools });

  const handleSend = (text: string) => {
    if (!isAIChat) return;
    void sendMessage(text);
  };

  const handleStop = () => {
    if (isAIChat) {
      void stopGeneration();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        isAIChat={isAIChat}
      />
      <ChatInput
        onSend={handleSend}
        onStop={isAIChat ? handleStop : undefined}
        disabled={isAIChat && isError}
        isStreaming={isLoading && isAIChat}
        placeholder={isAIChat ? t('chat.aiInputPlaceholder') : t('chat.inputPlaceholder')}
      />
    </div>
  );
};

export default ChatConversation;
