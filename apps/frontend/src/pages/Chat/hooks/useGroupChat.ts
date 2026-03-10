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

import { useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import ChatAdapter from '@/pages/Chat/types/chatAdapter';
import ChatInputFormValues from '@libs/chat/types/chatInputFormValues';
import getChatInputFormSchema from '@libs/chat/constants/getChatInputFormSchema';
import ChatMessageSsePayload from '@libs/chat/types/chatMessageSsePayload';
import GroupTypeLocation from '@libs/chat/types/groupTypeLocation';
import LOCATION_TO_GROUP_TYPE from '@libs/chat/constants/locationToGroupType';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import useChatProfilePictureStore from '@/store/useChatProfilePictureStore';
import useChatStore from '@/pages/Chat/useChatStore';
import useSseEventListener from '@/hooks/useSseEventListener';
import useUserStore from '@/store/UserStore/useUserStore';

const useGroupChat = (groupName: string, groupTypeLocation: GroupTypeLocation): ChatAdapter => {
  const { t } = useTranslation();
  const form = useForm<ChatInputFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(getChatInputFormSchema(t)),
    defaultValues: { message: '' },
  });
  const { messages, isLoading, isSending, error, fetchMessages, sendMessage, setCurrentConversation, addMessage } =
    useChatStore();
  const user = useUserStore((state) => state.user);
  const currentUsername = user?.username;

  const conversationType = LOCATION_TO_GROUP_TYPE[groupTypeLocation];

  const groupNameRef = useRef(groupName);
  const conversationTypeRef = useRef(conversationType);

  useEffect(() => {
    groupNameRef.current = groupName;
    conversationTypeRef.current = conversationType;
  }, [groupName, conversationType]);

  useEffect(() => {
    setCurrentConversation(conversationType, groupName);
    void fetchMessages(conversationType, groupName);
  }, [conversationType, groupName, setCurrentConversation, fetchMessages]);

  useEffect(() => {
    if (messages.length === 0) return;

    const usernames = [...new Set(messages.map((m) => m.createdBy).filter(Boolean) as string[])].filter(
      (u) => u !== currentUsername,
    );
    if (usernames.length === 0) return;

    void useChatProfilePictureStore.getState().fetchProfilePictures(usernames);
  }, [messages, currentUsername]);

  const handleNewMessage = useCallback(
    (e: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(e.data) as ChatMessageSsePayload;

        if (payload.groupName !== groupNameRef.current || payload.conversationType !== conversationTypeRef.current) {
          return;
        }

        if (payload.createdBy === currentUsername) {
          return;
        }

        const profilePictureStore = useChatProfilePictureStore.getState();

        if (payload.createdBy && payload.profilePictureHash) {
          const existingHash = profilePictureStore.cache[payload.createdBy]?.profilePictureHash as string | undefined;

          if (existingHash !== payload.profilePictureHash) {
            void profilePictureStore.fetchProfilePictures([payload.createdBy]);
          }

          profilePictureStore.updateCache(payload.createdBy, undefined, payload.profilePictureHash);
        }

        addMessage(payload);
      } catch (err) {
        console.error('Failed to parse SSE chat message', err);
      }
    },
    [currentUsername, addMessage],
  );

  useSseEventListener(SSE_MESSAGE_TYPE.CHAT_NEW_MESSAGE, handleNewMessage, { enabled: true });

  const onSubmit = useCallback(
    async (data: ChatInputFormValues): Promise<void> => {
      if (!data.message.trim() || isSending) return;

      const messageContent = data.message.trim();

      await sendMessage(conversationType, groupName, messageContent);
      form.reset();
    },
    [isSending, conversationType, groupName, sendMessage, form],
  );

  return {
    messages,
    form,
    onSubmit,
    isLoading: isLoading || isSending,
    error: error ? new Error(error) : null,
  };
};

export default useGroupChat;
