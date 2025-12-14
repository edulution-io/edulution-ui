/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CHAT_AI_PATH } from '@libs/chat/chatPaths';
import useAIChatStore from './useAIChatStore';

interface UseAIChatRoutingOptions {
  enabled?: boolean;
}

const useAIChatRouting = ({ enabled = true }: UseAIChatRoutingOptions = {}) => {
  const { chatId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();

  const { currentChatId, loadChat, clearMessages, fetchAIConfig, aiConfig, isLoading } = useAIChatStore();

  useEffect(() => {
    if (enabled && !aiConfig) {
      void fetchAIConfig();
    }
  }, [enabled, aiConfig, fetchAIConfig]);

  useEffect(() => {
    if (!enabled) return;

    if (isLoading) return;

    if (chatId && chatId !== currentChatId) {
      void loadChat(chatId);
    } else if (!chatId && currentChatId) {
      clearMessages();
    }
  }, [chatId, currentChatId, loadChat, clearMessages, enabled, isLoading]);

  useEffect(() => {
    if (enabled && currentChatId && !chatId && !isLoading) {
      navigate(`${CHAT_AI_PATH}/${currentChatId}`, { replace: true });
    }
  }, [currentChatId, chatId, navigate, enabled, isLoading]);

  return {
    chatId,
    isNewChat: !chatId,
  };
};

export default useAIChatRouting;
