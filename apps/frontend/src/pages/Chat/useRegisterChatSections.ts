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

import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type Section from '@libs/menubar/section';
import {
  CHAT_AICHAT_PATH,
  CHAT_CLASSES_LOCATION,
  CHAT_PATH,
  CHAT_PROJECTS_LOCATION,
} from '@libs/chat/constants/chatPaths';
import GroupTypeLocation from '@libs/chat/types/groupTypeLocation';
import useChatStore from '@/store/useChatStore';
import useAiChatStore from '@/store/useAiChatStore';
import useSubMenuStore from '@/store/useSubMenuStore';

const isValidGroupType = (value: string | undefined): value is GroupTypeLocation =>
  value === CHAT_CLASSES_LOCATION || value === CHAT_PROJECTS_LOCATION;

const useRegisterChatSections = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { groupType } = useParams<{ groupType: string; groupName: string }>();
  const { userGroups, fetchUserGroups } = useChatStore();
  const { conversations, fetchConversations } = useAiChatStore();
  const { setSections } = useSubMenuStore();

  const isAiChat = pathname.startsWith(`/${CHAT_AICHAT_PATH}`);

  useEffect(() => {
    if (isAiChat) {
      void fetchConversations();
    } else if (!userGroups) {
      void fetchUserGroups();
    }
  }, [isAiChat, userGroups, fetchUserGroups, fetchConversations]);

  const sections: Section[] = useMemo(() => {
    if (isAiChat) {
      return conversations.map((conv) => ({
        id: conv.id,
        label: conv.title,
        action: () => navigate(`/${CHAT_AICHAT_PATH}/${conv.id}`),
      }));
    }

    if (!userGroups || !isValidGroupType(groupType)) return [];

    const groups = groupType === CHAT_CLASSES_LOCATION ? userGroups.classes : userGroups.projects;

    return groups.map((group) => ({
      id: group.name,
      label: group.name,
      action: () => navigate(`/${CHAT_PATH}/${groupType}/${encodeURIComponent(group.name)}`),
    }));
  }, [isAiChat, conversations, userGroups, groupType, navigate]);

  useEffect(() => {
    setSections(sections);
    return () => setSections([]);
  }, [sections, setSections]);
};

export default useRegisterChatSections;
