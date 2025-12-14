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
import useAIChatStore from '@/pages/Chat/hooks/useAIChatStore';
import useChatStore from '@/pages/Chat/hooks/useChatStore';
import useLmnApiStore from '@/store/useLmnApiStore';
import { ChatType } from '@libs/chat/types/chatType';
import ChatInput from './ChatInput';
import ChatMessageList from './ChatMessageList';

interface ChatConversationProps {
  isPopout?: boolean;
}

const ChatConversation: React.FC<ChatConversationProps> = ({ isPopout = false }) => {
  const { t } = useTranslation();
  const { user } = useLmnApiStore();
  const { type } = useParams<{ type: ChatType }>();
  const { currentlyOpenChat } = useChatStore();

  const { messages, isLoading, sendMessage, stopGeneration } = useAIChatStore();

  const chatType = isPopout ? currentlyOpenChat?.type : type;
  const isAIChat = chatType === 'ai';

  const handleSend = (text: string) => {
    if (isAIChat && user) {
      void sendMessage(text, {
        cn: user.cn,
        displayName: user.displayName,
        givenName: user.givenName,
        sn: user.sn,
      });
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
        onStop={isAIChat ? stopGeneration : undefined}
        disabled={isLoading}
        isStreaming={isLoading && isAIChat}
        placeholder={isAIChat ? t('chat.aiInputPlaceholder') : undefined}
      />
    </div>
  );
};

export default ChatConversation;
