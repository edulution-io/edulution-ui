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
import cn from '@libs/common/utils/className';
import type ChatMessage from '@libs/chat/types/chatMessage';
import formatIsoDateToLocaleString from '@libs/common/utils/Date/formatIsoDateToLocaleString';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

const formatTime = (date: Date) => {
  const formatted = formatIsoDateToLocaleString(new Date(date).toISOString());
  return formatted.split(' ')[1] ?? '';
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwnMessage }) => (
    <div className={cn('flex w-full', isOwnMessage ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2',
          isOwnMessage ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md bg-accent text-background',
        )}
      >
        <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
        <div className={cn('mt-1 flex items-center gap-2 text-xs', isOwnMessage ? 'justify-end' : 'justify-between')}>
          {!isOwnMessage && (
            <span className="font-medium opacity-70">
              {message.createdByUserFirstName} {message.createdByUserLastName}
            </span>
          )}
          <span className={isOwnMessage ? 'text-white/70' : 'text-muted-foreground'}>
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );

export default ChatBubble;
