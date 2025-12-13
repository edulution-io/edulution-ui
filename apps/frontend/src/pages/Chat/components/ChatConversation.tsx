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

import React, { useState } from 'react';
import useLmnApiStore from '@/store/useLmnApiStore';
import ChatMessageData from '@libs/chat/types/chatMessageData';
import ChatMessageList from '@/pages/Chat/components/ChatMessageList';
import ChatInput from './ChatInput';

const ChatConversation = () => {
  const { user } = useLmnApiStore();
  const [messages, setMessages] = useState<ChatMessageData[]>([]);

  const handleSend = (text: string) => {
    const newMessage: ChatMessageData = {
      id: Date.now().toString(),
      text,
      sender: {
        cn: user?.cn || 'unknown',
        displayName: user?.displayName,
        firstName: user?.givenName,
        lastName: user?.sn,
      },
      timestamp: new Date().toISOString(),
      isOwn: true,
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div className="flex h-full flex-col">
      <ChatMessageList messages={messages} />
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default ChatConversation;
