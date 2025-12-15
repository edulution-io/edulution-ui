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

import React, { ReactElement, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import ResizableWindow from '@/components/structure/framing/ResizableWindow/ResizableWindow';
import ToggleDockButton from '@/components/structure/framing/ResizableWindow/Buttons/ToggleDockButton';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import useMedia from '@/hooks/useMedia';
import useChatStore from '@/pages/Chat/hooks/useChatStore';
import useAIChatStore from '@/pages/Chat/hooks/useAIChatStore';
import ChatConversation from '@/pages/Chat/components/ChatConversation';
import APPS from '@libs/appconfig/constants/apps';
import RESIZEABLE_WINDOW_DEFAULT_POSITION from '@libs/ui/constants/resizableWindowDefaultPosition';
import ChatHeaderAI from '@/pages/Chat/components/ChatHeaderAI';
import ChatType from '@libs/chat/types/chatType';

const ChatPopoutWindow = () => {
  const location = useLocation();
  const { isMobileView } = useMedia();
  const { setCurrentWindowedFrameSize } = useFrameStore();
  const { aiConfig } = useAIChatStore();

  const {
    currentlyOpenChat,
    setCurrentlyOpenChat,
    isChatPopoutVisible,
    setIsChatPopoutVisible,
    isChatDocked,
    setIsChatDocked,
  } = useChatStore();

  const resetChat = () => {
    setIsChatPopoutVisible(false);
    setIsChatDocked(true);
    setCurrentlyOpenChat(null);
  };

  useEffect(() => {
    resetChat();
  }, [isMobileView]);

  const pathSegments = location.pathname.split('/').filter(Boolean);

  const initialPositionMemo = useMemo(
    () => (isChatDocked ? { x: 0, y: 0 } : RESIZEABLE_WINDOW_DEFAULT_POSITION),
    [isChatDocked],
  );

  const initialSizeMemo = useMemo(() => (isChatDocked ? { width: 400, height: 500 } : undefined), [isChatDocked]);

  const hideOnOtherPages = pathSegments[0] === APPS.CHAT && isChatDocked;

  if (!isChatPopoutVisible || !currentlyOpenChat || hideOnOtherPages) {
    return null;
  }

  const getWindowTitle = () => {
    if (currentlyOpenChat.type === ChatType.AI) {
      return aiConfig?.label;
    }
    if (currentlyOpenChat.type === ChatType.USER) {
      return currentlyOpenChat.user?.displayName || currentlyOpenChat.chatId;
    }
    return currentlyOpenChat.groupName || currentlyOpenChat.chatId;
  };

  const windowTitle = getWindowTitle();

  const additionalButtons = [
    !isMobileView && !isChatDocked && (
      <ToggleDockButton
        onClick={() => {
          setIsChatDocked(!isChatDocked);
          setCurrentWindowedFrameSize(windowTitle || '', undefined);
        }}
        isDocked={isChatDocked}
        key={ToggleDockButton.name}
      />
    ),
  ].filter((b): b is ReactElement => Boolean(b));

  const isAIChat = currentlyOpenChat.type === ChatType.AI;

  return (
    <ResizableWindow
      disableMinimizeWindow={isChatDocked || isMobileView}
      disableToggleMaximizeWindow={isMobileView}
      titleTranslationId={windowTitle || ''}
      handleClose={resetChat}
      initialPosition={isMobileView ? undefined : initialPositionMemo}
      initialSize={isMobileView ? undefined : initialSizeMemo}
      openMaximized={isMobileView}
      stickToInitialSizeAndPositionWhenRestored={!isMobileView && isChatDocked}
      additionalButtons={additionalButtons}
    >
      <div className="flex h-full flex-col overflow-hidden">
        {isAIChat && <ChatHeaderAI isPopout />}
        <ChatConversation isPopout />
      </div>
    </ResizableWindow>
  );
};

export default ChatPopoutWindow;
