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

import { useState, useCallback, useEffect, useRef, FormEvent } from 'react';
import ChatAdapter from '@libs/chat/types/chatAdapter';
import ChatMessageSsePayload from '@libs/chat/types/chatMessageSsePayload';
import GROUP_TYPES from '@libs/chat/constants/groupTypes';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import useChatStore from '@/store/useChatStore';
import useSseEventListener from '@/hooks/useSseEventListener';
import useUserStore from '@/store/UserStore/useUserStore';

import GroupTypeLocation from '@libs/chat/types/groupTypeLocation';
import { CHAT_GROUP_TYPE_LOCATIONS } from '@libs/chat/constants/chatPaths';

const locationToGroupType: Record<GroupTypeLocation, string> = {
  [CHAT_GROUP_TYPE_LOCATIONS.CLASSES]: GROUP_TYPES.CLASS,
  [CHAT_GROUP_TYPE_LOCATIONS.PROJECTS]: GROUP_TYPES.PROJECT,
};

const useGroupChat = (groupName: string, groupTypeLocation: GroupTypeLocation): ChatAdapter => {
  const [input, setInput] = useState('');
  const { messages, isLoading, isSending, error, fetchMessages, sendMessage, setCurrentConversation, addMessage } =
    useChatStore();
  const user = useUserStore((state) => state.user);
  const currentUsername = user?.username;

  const groupType = locationToGroupType[groupTypeLocation];

  const groupNameRef = useRef(groupName);
  const groupTypeRef = useRef(groupType);

  useEffect(() => {
    groupNameRef.current = groupName;
    groupTypeRef.current = groupType;
  }, [groupName, groupType]);

  useEffect(() => {
    setCurrentConversation(groupType, groupName);
    void fetchMessages(groupType, groupName);
  }, [groupType, groupName, setCurrentConversation, fetchMessages]);

  const handleNewMessage = useCallback(
    (e: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(e.data) as ChatMessageSsePayload;

        if (payload.groupName !== groupNameRef.current || payload.groupType !== groupTypeRef.current) {
          return;
        }

        if (payload.createdBy === currentUsername) {
          return;
        }

        addMessage(payload);
      } catch {
        console.error('Failed to parse SSE chat message');
      }
    },
    [currentUsername, addMessage],
  );

  useSseEventListener(SSE_MESSAGE_TYPE.CHAT_NEW_MESSAGE, handleNewMessage, { enabled: true });

  const handleSubmit = useCallback(
    async (e?: FormEvent): Promise<void> => {
      e?.preventDefault();

      if (!input.trim() || isSending) return;

      const messageContent = input.trim();
      setInput('');

      await sendMessage(groupType, groupName, messageContent);
    },
    [input, isSending, groupType, groupName, sendMessage],
  );

  return {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading: isLoading || isSending,
    error: error ? new Error(error) : null,
  };
};

export default useGroupChat;
