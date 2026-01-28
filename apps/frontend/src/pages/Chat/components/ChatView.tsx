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
import { useTranslation } from 'react-i18next';
import type ChatAdapter from '@libs/chat/types/chatAdapter';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface ChatViewProps {
  adapter: ChatAdapter;
  title?: string;
}

const ChatView: React.FC<ChatViewProps> = ({ adapter, title }) => {
  const { t } = useTranslation();
  const { messages, input, setInput, handleSubmit, isLoading, error } = adapter;

  return (
    <div className="bg-glass flex h-full flex-col rounded-xl backdrop-blur-lg">
      {title && (
        <div className="border-b border-muted px-4 py-3">
          <h3 className="font-semibold text-background">{title}</h3>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 mx-4 mt-4 rounded-lg p-3 text-sm text-destructive">
          {t('chat.error')}: {error.message}
        </div>
      )}

      <ChatMessages
        messages={messages}
        isLoading={isLoading}
      />

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatView;
