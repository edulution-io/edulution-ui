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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import MenuItem from '@libs/menubar/menuItem';
import APPS from '@libs/appconfig/constants/apps';
import useChatHistory from '@/pages/AiAssist/hooks/useChatHistory';
import { FileSharingIcon } from '@/assets/icons';

const useAiChatMenuConfig = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const { history, fetchHistory, selectedChatId, setSelectedChatId } = useChatHistory();

  const pathParts = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);
  const firstPathPart = pathParts[0] || '';
  const previousFirstPathPart = useRef<string | null>(null);

  useEffect(() => {
    if (firstPathPart !== previousFirstPathPart.current) {
      previousFirstPathPart.current = firstPathPart;

      if (firstPathPart === APPS.AI_ASSIST) {
        void fetchHistory();
      }
    }
  }, [firstPathPart, fetchHistory]);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      console.log('select chat', chatId);
      setSelectedChatId(chatId);
      navigate(`/${APPS.AI_ASSIST}/${chatId}`, { replace: true });
    },
    [navigate, setSelectedChatId],
  );

  const handleNewChat = useCallback(() => {
    setSelectedChatId(null);
    navigate(`/${APPS.AI_ASSIST}`, { replace: true });
  }, [navigate, setSelectedChatId]);

  useEffect(() => {
    const newChatItem: MenuItem = {
      id: 'new-chat',
      label: t('aiChat.newChat', { defaultValue: 'Neuer Chat' }),
      icon: FileSharingIcon,
      action: handleNewChat,
    };

    const chatItems: MenuItem[] = history.map((chat) => ({
      id: chat._id,
      label: chat.title || t('aiChat.untitledChat', { defaultValue: 'Unbenannter Chat' }),
      icon: FileSharingIcon,
      color: selectedChatId === chat._id ? 'bg-primary' : 'hover:bg-ciLightBlue',
      action: () => handleSelectChat(chat._id),
      disableTranslation: true,
    }));

    setMenuItems([newChatItem, ...chatItems]);
  }, [history, selectedChatId, handleSelectChat, handleNewChat]);

  return {
    title: 'aiChat.title',
    icon: FileSharingIcon,
    color: 'hover:bg-ciLightBlue',
    appName: APPS.AI_ASSIST,
    menuItems,
  };
};

export default useAiChatMenuConfig;
