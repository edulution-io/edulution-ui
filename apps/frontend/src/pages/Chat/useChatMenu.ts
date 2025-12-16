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

import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { ChatIcon, UserIcon } from '@/assets/icons';
import APPS from '@libs/appconfig/constants/apps';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import useLmnApiStore from '@/store/useLmnApiStore';
import removeSchoolPrefix from '@libs/classManagement/utils/removeSchoolPrefix';
import Avatar from '@/components/shared/Avatar';
import AvatarStack from '@/components/shared/AvatarStack';
import AILogo from '@/components/shared/AILogo';
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
import useAIChatStore from '@/pages/Chat/hooks/useAIChatStore';
import { t } from 'i18next';

const useChatMenu = () => {
  const navigate = useNavigate();
  const { user } = useLmnApiStore();
  const schoolPrefix = user?.sophomorixSchoolPrefix || user?.school;

  const { schoolClasses, projects, groupsKey } = useChatGroups();
  const { members, membersPerGroup } = useChatMembers({ schoolClasses, projects, groupsKey });

  const { chatList, loadChatList, clearMessages, loadChat, deleteChat } = useAIChatStore();

  useEffect(() => {
    void loadChatList();
  }, [loadChatList]);

  const navigateToGroup = useCallback((groupCn: string) => navigate(`${CHAT_GROUPS_PATH}/${groupCn}`), [navigate]);
  const navigateToUser = useCallback((userCn: string) => navigate(`${CHAT_USERS_PATH}/${userCn}`), [navigate]);

  const navigateToAiChat = useCallback(
    (chatId?: string) => {
      if (chatId) {
        void loadChat(chatId);
        navigate(`${CHAT_AI_PATH}/${chatId}`);
      } else {
        clearMessages();
        navigate(CHAT_AI_PATH);
      }
    },
    [navigate, clearMessages, loadChat],
  );

  const groupChildren = useMemo(() => {
    const children = [];

    if (schoolClasses.length) {
      children.push(
        ...schoolClasses.map((schoolClass) => {
          const groupMembers = membersPerGroup[schoolClass.cn] || [];
          const avatarUsers = groupMembers.map((m) => ({
            username: m.cn,
            firstName: m.givenName,
            lastName: m.sn,
          }));

          return {
            id: schoolClass.cn,
            label: removeSchoolPrefix(schoolClass.displayName || schoolClass.cn, schoolPrefix),
            iconComponent:
              avatarUsers.length > 0
                ? React.createElement(AvatarStack, {
                    users: avatarUsers,
                    max: 3,
                    avatarClassName: 'h-5 w-5',
                  })
                : undefined,
            icon: avatarUsers.length === 0 ? UserIcon : undefined,
            action: () => navigateToGroup(schoolClass.cn),
            disableTranslation: true,
          };
        }),
      );
    }

    if (projects.length) {
      children.push(
        ...projects.map((project) => {
          const groupMembers = membersPerGroup[project.cn] || [];
          const avatarUsers = groupMembers.map((m) => ({
            username: m.cn,
            firstName: m.givenName,
            lastName: m.sn,
          }));

          return {
            id: project.cn,
            label: removeSchoolPrefix(project.displayName || project.cn, schoolPrefix),
            iconComponent:
              avatarUsers.length > 0
                ? React.createElement(AvatarStack, {
                    users: avatarUsers,
                    max: 3,
                    avatarClassName: 'h-5 w-5',
                  })
                : undefined,
            icon: avatarUsers.length === 0 ? UserIcon : undefined,
            action: () => navigateToGroup(project.cn),
            disableTranslation: true,
          };
        }),
      );
    }

    return children;
  }, [schoolClasses, projects, schoolPrefix, navigateToGroup, membersPerGroup]);

  const userChildren = useMemo(() => {
    if (!members.length) return [];

    return [...members]
      .sort((a, b) => (a.displayName || a.cn).localeCompare(b.displayName || b.cn))
      .map((member) => ({
        id: member.cn,
        label: member.displayName || member.cn,
        iconComponent: React.createElement(Avatar, {
          user: {
            username: member.cn,
            firstName: member.givenName,
            lastName: member.sn,
          },
          className: 'h-6 w-6',
        }),
        action: () => navigateToUser(member.cn),
        disableTranslation: true,
      }));
  }, [members, navigateToUser]);

  const aiChildren = useMemo(() => {
    const children: Array<{
      id: string;
      label: string;
      iconComponent: React.ReactNode;
      action: () => void;
      disableTranslation?: boolean;
      onDelete?: () => void;
    }> = [
      {
        id: 'ai-new',
        label: t('chat.newChat'),
        iconComponent: React.createElement(MdAdd, { className: 'h-5 w-5' }),
        action: () => navigateToAiChat(),
      },
    ];

    if (chatList.length > 0) {
      children.push(
        ...chatList.map((chat) => ({
          id: chat.id,
          label: chat.title || t('chat.untitledChat'),
          iconComponent: React.createElement(AILogo, { className: 'h-5 w-5' }),
          action: () => navigateToAiChat(chat.id),
          disableTranslation: true,
          onDelete: () => {
            void deleteChat(chat.id);
          },
        })),
      );
    }

    return children;
  }, [chatList, navigateToAiChat, deleteChat]);

  return useMemo(
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
};

export default useChatMenu;
