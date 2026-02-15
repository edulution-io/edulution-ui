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

import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { faUsers, faUserGear, faRobot } from '@fortawesome/free-solid-svg-icons';
import { ContactIcon } from '@/assets/icons';
import APPS from '@libs/appconfig/constants/apps';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import {
  CHAT_AICHAT_LOCATION,
  CHAT_AICHAT_PATH,
  CHAT_CLASSES_LOCATION,
  CHAT_CLASSES_PATH,
  CHAT_PROJECTS_LOCATION,
  CHAT_PROJECTS_PATH,
} from '@libs/chat/constants/chatPaths';
import useAiChatStore from '@/store/useAiChatStore';

const useChatMenu = (): MenuBarEntry => {
  const navigate = useNavigate();
  const { createConversation } = useAiChatStore();

  const navigateToClasses = useCallback(() => navigate(`/${CHAT_CLASSES_PATH}`), [navigate]);
  const navigateToProjects = useCallback(() => navigate(`/${CHAT_PROJECTS_PATH}`), [navigate]);
  const navigateToAiChat = useCallback(() => {
    void createConversation().then((newId) => {
      if (newId) {
        navigate(`/${CHAT_AICHAT_PATH}/${newId}`);
      }
    });
  }, [createConversation, navigate]);

  return useMemo(
    () => ({
      title: 'chat.title',
      icon: ContactIcon,
      color: 'hover:bg-ciGreenToBlue',
      appName: APPS.CHAT,
      menuItems: [
        {
          id: CHAT_CLASSES_LOCATION,
          label: 'chat.schoolClasses',
          icon: faUsers,
          action: navigateToClasses,
        },
        {
          id: CHAT_PROJECTS_LOCATION,
          label: 'chat.projects',
          icon: faUserGear,
          action: navigateToProjects,
        },
        {
          id: CHAT_AICHAT_LOCATION,
          label: 'chat.aiChat',
          icon: faRobot,
          action: navigateToAiChat,
        },
      ],
    }),
    [navigateToClasses, navigateToProjects, navigateToAiChat],
  );
};

export default useChatMenu;
