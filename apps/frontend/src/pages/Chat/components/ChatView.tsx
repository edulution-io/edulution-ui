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
import { cn } from '@edulution-io/ui-kit';
import type ChatAdapter from '@/pages/Chat/types/chatAdapter';
import { BadgeSH } from '@/components/ui/BadgeSH';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSH,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenuSH';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface ChatViewProps {
  adapter: ChatAdapter;
  title?: string;
  subtitle?: string;
  activeViewers?: string[];
  groupMembers?: string[];
}

const ChatView: React.FC<ChatViewProps> = ({ adapter, title, subtitle, activeViewers = [], groupMembers = [] }) => {
  const { t } = useTranslation();
  const { messages, input, setInput, handleSubmit, isLoading, error } = adapter;
  const hasError = !!error;

  return (
    <div className="flex h-full flex-col pb-2">
      {title && (
        <div className="flex w-full flex-col border-b border-muted px-4 pb-2 pt-2">
          <h3 className="font-semibold text-background">{title}</h3>
          <div className="mt-1 flex items-center gap-2">
            {subtitle && (
              <BadgeSH
                variant="secondary"
                className="h-auto w-fit px-1.5 py-0 text-[10px]"
              >
                {subtitle}
              </BadgeSH>
            )}
            {groupMembers.length > 0 && (
              <DropdownMenuSH>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="ml-auto flex cursor-pointer items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    {t('chat.members', { count: groupMembers.length })}
                    {activeViewers.length > 0 && (
                      <>
                        ,
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                        {t('chat.online', { count: activeViewers.length })}
                      </>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent className="max-h-[300px] min-w-[8rem] overflow-y-auto rounded-lg border-none bg-accent-light p-1 shadow-md">
                    {groupMembers.map((username) => (
                      <DropdownMenuItem
                        key={username}
                        className="flex items-center space-x-2 rounded-lg bg-accent-light px-4 py-2"
                      >
                        <span
                          className={cn(
                            'inline-block h-1.5 w-1.5 rounded-full',
                            activeViewers.includes(username) ? 'bg-green-500' : 'bg-gray-400',
                          )}
                        />
                        <span>{username}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenuSH>
            )}
          </div>
        </div>
      )}

      <ChatMessages messages={messages} />

      {!hasError && (
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default ChatView;
