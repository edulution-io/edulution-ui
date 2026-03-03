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
import ChatAdapter from '@/pages/Chat/types/chatAdapter';
import ChatMessageSsePayload from '@libs/chat/types/chatMessageSsePayload';
import GroupTypeLocation from '@libs/chat/types/groupTypeLocation';
import LOCATION_TO_GROUP_TYPE from '@libs/chat/constants/locationToGroupType';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import useChatProfilePictureStore from '@/store/useChatProfilePictureStore';
import useChatStore from '@/store/useChatStore';
import useSseEventListener from '@/hooks/useSseEventListener';
import useUserStore from '@/store/UserStore/useUserStore';

const useGroupChat = (groupName: string, groupTypeLocation: GroupTypeLocation): ChatAdapter => {
  const [input, setInput] = useState('');
  const { messages, isLoading, isSending, error, fetchMessages, sendMessage, setCurrentConversation, addMessage } =
    useChatStore();
  const user = useUserStore((state) => state.user);
  const currentUsername = user?.username;

  const sophomorixType = LOCATION_TO_GROUP_TYPE[groupTypeLocation];

  const groupNameRef = useRef(groupName);
  const sophomorixTypeRef = useRef(sophomorixType);

  useEffect(() => {
    groupNameRef.current = groupName;
    sophomorixTypeRef.current = sophomorixType;
  }, [groupName, sophomorixType]);

  useEffect(() => {
    setCurrentConversation(sophomorixType, groupName);
    void fetchMessages(sophomorixType, groupName);
  }, [sophomorixType, groupName, setCurrentConversation, fetchMessages]);

  const handleNewMessage = useCallback(
    (e: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(e.data) as ChatMessageSsePayload;

        if (payload.groupName !== groupNameRef.current || payload.sophomorixType !== sophomorixTypeRef.current) {
          return;
        }

        if (payload.createdBy === currentUsername) {
          return;
        }

        useChatProfilePictureStore
          .getState()
          .updateCache(payload.createdBy, payload.profilePicture, payload.profilePictureHash);

        addMessage(payload);
      } catch (err) {
        console.error('Failed to parse SSE chat message', err);
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

      await sendMessage(sophomorixType, groupName, messageContent);
    },
    [input, isSending, sophomorixType, groupName, sendMessage],
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
