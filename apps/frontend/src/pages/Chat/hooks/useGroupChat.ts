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

import { useState, useCallback, FormEvent } from 'react';
import type ChatAdapter from '@libs/chat/types/chatAdapter';
import type ChatMessage from '@libs/chat/types/chatMessage';
import useUserStore from '@/store/UserStore/useUserStore';
import getRandomUUID from '@/utils/getRandomUUID';
import CHAT_ROLES from '@libs/chat/constants/chatRoles';

const useGroupChat = (_groupId: string, _groupType: 'classes' | 'projects'): ChatAdapter => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useUserStore();

  const handleSubmit = useCallback(
    async (e?: FormEvent): Promise<void> => {
      e?.preventDefault();

      if (!input.trim() || isLoading) return;

      const messageContent = input.trim();
      setInput('');
      setIsLoading(true);
      setError(null);

      const newMessage: ChatMessage = {
        id: getRandomUUID(),
        role: CHAT_ROLES.USER,
        content: messageContent,
        createdAt: new Date(),
        createdBy: user?.username,
        createdByName: user ? `${user.firstName} ${user.lastName}` : undefined,
      };

      setMessages((prev) => [...prev, newMessage]);

      await Promise.resolve();

      setIsLoading(false);
    },
    [input, isLoading, user],
  );

  return {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    error,
  };
};

export default useGroupChat;
