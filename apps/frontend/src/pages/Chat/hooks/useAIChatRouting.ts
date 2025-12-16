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

/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CHAT_AI_PATH } from '@libs/chat/chatPaths';
import useAIChatStore from './useAIChatStore';
import useChatStore from './useChatStore';

interface UseAIChatRoutingOptions {
  enabled?: boolean;
  isPopout?: boolean;
}

const useAIChatRouting = ({ enabled = true, isPopout = false }: UseAIChatRoutingOptions = {}) => {
  const { chatId: urlChatId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();

  const { currentChatId, loadChat, clearMessages, fetchAIConfig, aiConfig, isLoading } = useAIChatStore();
  const { currentlyOpenChat, isChatPopoutVisible, isChatDocked } = useChatStore();

  const isPopoutActive = isChatPopoutVisible && !isChatDocked;

  const chatId = isPopout ? currentlyOpenChat?.chatId : urlChatId;

  useEffect(() => {
    if (enabled && !aiConfig) {
      void fetchAIConfig();
    }
  }, [enabled, aiConfig, fetchAIConfig]);

  useEffect(() => {
    if (!enabled) return;
    if (isLoading) return;

    if (chatId && chatId !== 'new' && chatId !== 'ai' && chatId !== currentChatId) {
      void loadChat(chatId);
    } else if (!chatId && currentChatId && !isPopout && !isPopoutActive) {
      clearMessages();
    }
  }, [chatId, currentChatId, loadChat, clearMessages, enabled, isLoading, isPopout, isPopoutActive]);

  useEffect(() => {
    if (isPopout || isPopoutActive) return;

    if (enabled && currentChatId && !urlChatId && !isLoading) {
      navigate(`${CHAT_AI_PATH}/${currentChatId}`, { replace: true });
    }
  }, [currentChatId, urlChatId, navigate, enabled, isLoading, isPopout, isPopoutActive]);

  return {
    chatId,
    isNewChat: !chatId || chatId === 'ai',
  };
};

export default useAIChatRouting;
