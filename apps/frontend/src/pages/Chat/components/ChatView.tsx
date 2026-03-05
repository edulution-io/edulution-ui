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
import type ChatAdapter from '@/pages/Chat/types/chatAdapter';
import { BadgeSH } from '@/components/ui/BadgeSH';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface ChatViewProps {
  adapter: ChatAdapter;
  title?: string;
  subtitle?: string;
}

const ChatView: React.FC<ChatViewProps> = ({ adapter, title, subtitle }) => {
  const { messages, form, onSubmit, isLoading, error } = adapter;

  return (
    <div className="flex h-full flex-col pb-2">
      {title && (
        <div className="flex w-full flex-col border-b border-muted px-4 pb-2 pt-2">
          <h3 className="font-semibold text-background">{title}</h3>
          {subtitle && (
            <BadgeSH
              variant="secondary"
              className="mt-1 h-auto w-fit px-1.5 py-0 text-[10px]"
            >
              {subtitle}
            </BadgeSH>
          )}
        </div>
      )}

      <ChatMessages messages={messages} />

      <ChatInput
        form={form}
        onSubmit={onSubmit}
        isLoading={isLoading || !!error}
      />
    </div>
  );
};

export default ChatView;
