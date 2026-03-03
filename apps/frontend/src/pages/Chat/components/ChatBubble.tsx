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
import type ChatMessage from '@libs/chat/types/chatMessage';
import { cn } from '@edulution-io/ui-kit';
import getChatUserColor from '@libs/chat/utils/getChatUserColor';
import formatIsoDateToTimeString from '@libs/common/utils/Date/formatIsoDateToTimeString';
import Avatar from '@/components/shared/Avatar';
import useChatProfilePictureStore from '@/store/useChatProfilePictureStore';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwnMessage }) => {
  const cachedProfilePicture = useChatProfilePictureStore((state) =>
    state.getCachedProfilePicture(message.createdBy ?? ''),
  );

  const nameParts = [message.createdByUserFirstName, message.createdByUserLastName].filter(Boolean);
  const displayName = nameParts.length > 0 ? nameParts.join(' ') : message.createdBy;

  return (
    <div className={cn('flex w-full', isOwnMessage ? 'justify-end' : 'justify-start')}>
      {!isOwnMessage && (
        <div className="mr-2 flex-shrink-0 self-end">
          <Avatar
            user={{
              username: message.createdBy || '',
              firstName: message.createdByUserFirstName,
              lastName: message.createdByUserLastName,
            }}
            imageSrc={cachedProfilePicture}
            className="h-8 w-8"
          />
        </div>
      )}
      <div
        className={cn(
          'bg-glass max-w-[75%] rounded-2xl px-4 py-2 backdrop-blur-lg',
          isOwnMessage ? 'rounded-br-md text-background' : 'rounded-bl-md text-background',
        )}
      >
        {!isOwnMessage && displayName && (
          <div className="flex items-baseline justify-between gap-2">
            <span
              className="text-xs font-semibold"
              style={{ color: getChatUserColor(message.createdBy ?? '') }}
            >
              {displayName}
            </span>
            <span className="text-background/70 text-xs">{formatIsoDateToTimeString(message.createdAt)}</span>
          </div>
        )}
        <p className="whitespace-pre-wrap break-words text-sm">
          {message.content}
          {isOwnMessage && (
            <span className="text-background/70 float-right ml-3 mt-1 text-xs">
              {formatIsoDateToTimeString(message.createdAt)}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ChatBubble;
