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
import { useNavigate, useParams } from 'react-router-dom';
import type Section from '@libs/menubar/section';
import { CHAT_CLASSES_LOCATION, CHAT_GROUPS_LOCATION, CHAT_PATH } from '@libs/chat/constants/chatPaths';
import isValidGroupTypeLocation from '@libs/chat/utils/isValidGroupTypeLocation';
import removeSchoolPrefix from '@libs/classManagement/utils/removeSchoolPrefix';
import useChatStore from '@/store/useChatStore';
import useLmnApiStore from '@/store/useLmnApiStore';
import useSubMenuStore from '@/store/useSubMenuStore';

const useRegisterChatSections = () => {
  const navigate = useNavigate();
  const { groupType } = useParams<{ groupType: string; groupName: string }>();
  const { userGroups, fetchUserGroups } = useChatStore();
  const { user } = useLmnApiStore();
  const { setSections } = useSubMenuStore();

  useEffect(() => {
    if (!userGroups) {
      void fetchUserGroups();
    }
  }, [userGroups, fetchUserGroups]);

  const sections: Section[] = useMemo(() => {
    if (!userGroups || !isValidGroupTypeLocation(groupType)) return [];

    let groups;
    if (groupType === CHAT_CLASSES_LOCATION) {
      groups = userGroups.classes;
    } else if (groupType === CHAT_GROUPS_LOCATION) {
      groups = userGroups.groups;
    } else {
      groups = userGroups.projects;
    }

    return groups.map((group) => ({
      id: group.name,
      label: removeSchoolPrefix(group.name, user?.school),
      action: () => navigate(`/${CHAT_PATH}/${groupType}/${encodeURIComponent(group.name)}`),
    }));
  }, [userGroups, groupType, navigate, user?.school]);

  useEffect(() => {
    setSections(sections, groupType);
    return () => setSections([]);
  }, [sections, setSections, groupType]);
};

export default useRegisterChatSections;
