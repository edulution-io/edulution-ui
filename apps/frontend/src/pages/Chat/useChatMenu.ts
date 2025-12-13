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
import { ChatIcon, UserIcon } from '@/assets/icons';
import APPS from '@libs/appconfig/constants/apps';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import useLmnApiStore from '@/store/useLmnApiStore';
import removeSchoolPrefix from '@libs/classManagement/utils/removeSchoolPrefix';
import {
  CHAT_AI_LOCATION,
  CHAT_AI_PATH,
  CHAT_GROUPS_LOCATION,
  CHAT_GROUPS_PATH,
  CHAT_USERS_LOCATION,
  CHAT_USERS_PATH,
} from '@libs/chat/chatPaths';
import useChatMembers from '@/pages/Chat/hooks/useChatMembers';
import useChatGroups from '@/pages/Chat/hooks/useChatGroups';

const useChatMenu = () => {
  const navigate = useNavigate();
  const { user } = useLmnApiStore();
  const schoolPrefix = user?.sophomorixSchoolPrefix || user?.school;

  const { schoolClasses, projects, groupsKey } = useChatGroups();

  const { members } = useChatMembers({ schoolClasses, projects, groupsKey });

  const navigateToGroup = useCallback((groupCn: string) => navigate(`${CHAT_GROUPS_PATH}/${groupCn}`), [navigate]);

  const navigateToUser = useCallback((userCn: string) => navigate(`${CHAT_USERS_PATH}/${userCn}`), [navigate]);

  const navigateToAiChat = useCallback((chatId: string) => navigate(`${CHAT_AI_PATH}/${chatId}`), [navigate]);

  const groupChildren = useMemo(() => {
    const children = [];

    if (schoolClasses.length) {
      children.push(
        ...schoolClasses.map((schoolClass) => ({
          id: schoolClass.cn,
          label: removeSchoolPrefix(schoolClass.displayName || schoolClass.cn, schoolPrefix),
          icon: UserIcon,
          action: () => navigateToGroup(schoolClass.cn),
          disableTranslation: true,
        })),
      );
    }

    if (projects.length) {
      children.push(
        ...projects.map((project) => ({
          id: project.cn,
          label: removeSchoolPrefix(project.displayName || project.cn, schoolPrefix),
          icon: UserIcon,
          action: () => navigateToGroup(project.cn),
          disableTranslation: true,
        })),
      );
    }

    return children;
  }, [schoolClasses, projects, schoolPrefix, navigateToGroup]);

  const userChildren = useMemo(() => {
    if (!members.length) return [];

    return [...members]
      .sort((a, b) => (a.displayName || a.cn).localeCompare(b.displayName || b.cn))
      .map((member) => ({
        id: member.cn,
        label: member.displayName || member.cn,
        icon: UserIcon,
        action: () => navigateToUser(member.cn),
        disableTranslation: true,
      }));
  }, [members, navigateToUser]);

  const aiChildren = useMemo(
    () => [
      {
        id: 'ai-new',
        label: 'Neuer Chat',
        icon: UserIcon,
        action: () => navigateToAiChat('ai-new'),
        disableTranslation: true,
      },
    ],
    [navigateToAiChat],
  );

  const menuBar = useMemo(
    (): MenuBarEntry => ({
      title: 'chat.title',
      appName: APPS.CHAT,
      icon: ChatIcon,
      color: 'hover:bg-ciGreenToBlue',
      menuItems: [
        {
          id: CHAT_GROUPS_LOCATION,
          label: 'chat.groups',
          icon: UserIcon,
          action: () => navigate(CHAT_GROUPS_PATH),
          children: groupChildren,
        },
        {
          id: CHAT_USERS_LOCATION,
          label: 'chat.users',
          icon: UserIcon,
          action: () => navigate(CHAT_USERS_PATH),
          children: userChildren,
        },
        {
          id: CHAT_AI_LOCATION,
          label: 'chat.ai',
          icon: UserIcon,
          action: () => navigate(CHAT_AI_PATH),
          children: aiChildren,
        },
      ],
    }),
    [navigate, groupChildren, userChildren, aiChildren],
  );

  return menuBar;
};

export default useChatMenu;
