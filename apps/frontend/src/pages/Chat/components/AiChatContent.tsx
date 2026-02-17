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

import React, { useEffect } from 'react';
import ChatView from '@/pages/Chat/components/ChatView';
import useAiChat from '@/pages/Chat/hooks/useAiChat';
import useAiChatStore from '@/store/useAiChatStore';

const AI_CHAT_TITLE = 'AI Chat';

interface AiChatContentProps {
  chatId: string;
}

const AiChatContent: React.FC<AiChatContentProps> = ({ chatId }) => {
  const adapter = useAiChat(chatId);
  const conversations = useAiChatStore((state) => state.conversations);
  const assistants = useAiChatStore((state) => state.assistants);
  const selectedAssistantId = useAiChatStore((state) => state.selectedAssistantId);
  const fetchAssistants = useAiChatStore((state) => state.fetchAssistants);
  const setSelectedAssistantId = useAiChatStore((state) => state.setSelectedAssistantId);
  const title = conversations.find((c) => c.id === chatId)?.title ?? AI_CHAT_TITLE;

  useEffect(() => {
    void fetchAssistants();
  }, [fetchAssistants]);

  return (
    <ChatView
      adapter={adapter}
      title={title}
      assistants={assistants}
      selectedAssistantId={selectedAssistantId}
      onAssistantChange={setSelectedAssistantId}
    />
  );
};

export default AiChatContent;
