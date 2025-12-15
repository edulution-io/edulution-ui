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
import Avatar from '@/components/shared/Avatar';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import AILogo from '@/components/shared/AILogo';
import ChatMessageData from '@libs/chat/types/chatMessageData';
import useAIChatStore from '@/pages/Chat/hooks/useAIChatStore';
import formatIsoDateToLocaleString from '@libs/common/utils/Date/formatIsoDateToLocaleString';
import ToolInvocation from './ToolInvocation';

interface ChatMessageProps {
  message: ChatMessageData;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { aiConfig } = useAIChatStore();
  const { text, sender, timestamp, isOwn, isStreaming, toolInvocations } = message;

  const hasToolInvocations = toolInvocations && toolInvocations.length > 0;

  return (
    <div className={cn('flex gap-3', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {sender.isAI ? (
        <AILogo
          provider={aiConfig?.provider}
          size="sm"
        />
      ) : (
        <Avatar
          user={{
            username: sender.cn,
            firstName: sender.firstName,
            lastName: sender.lastName,
          }}
          className="h-8 w-8 flex-shrink-0"
        />
      )}

      <div className={cn('flex max-w-[80%] flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
        <span className="text-xs font-medium text-muted-foreground">{sender.displayName || sender.cn}</span>

        {hasToolInvocations && (
          <div className="w-full">
            {toolInvocations.map((invocation) => (
              <ToolInvocation
                key={invocation.toolInvocation.toolCallId}
                invocation={invocation}
              />
            ))}
          </div>
        )}

        {text && (
          <div
            className={cn(
              'rounded-2xl px-4 py-2',
              isOwn
                ? 'bg-accent/50 rounded-br-md border border-muted text-background'
                : 'rounded-bl-md bg-muted text-background',
              isStreaming && 'animate-pulse',
            )}
          >
            {sender.isAI ? (
              <MarkdownRenderer
                content={text}
                className="text-sm text-background"
              />
            ) : (
              <p className="whitespace-pre-wrap break-words text-sm">{text}</p>
            )}
          </div>
        )}

        <span className="text-xs text-muted-foreground">{formatIsoDateToLocaleString(timestamp, true)}</span>
      </div>
    </div>
  );
};

export default ChatMessage;
