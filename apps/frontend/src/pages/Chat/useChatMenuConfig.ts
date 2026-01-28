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

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { faUsers, faUserGear } from '@fortawesome/free-solid-svg-icons';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import useLmnApiStore from '@/store/useLmnApiStore';
import { ContactIcon } from '@/assets/icons';
import MenuItem from '@libs/menubar/menuItem';
import APPS from '@libs/appconfig/constants/apps';
import { CHAT_CLASSES_PATH, CHAT_PROJECTS_PATH } from '@libs/chat/constants/chatPaths';
import getUserRegex from '@libs/lmnApi/constants/userRegex';
import type LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import type LmnApiProject from '@libs/lmnApi/types/lmnApiProject';

const useChatMenuConfig = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, lmnApiToken } = useLmnApiStore();
  const { userSchoolClasses, userProjects, fetchUserSchoolClasses, fetchUserProjects } = useClassManagementStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const pathParts = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);
  const firstPathPart = pathParts[0] || '';
  const previousFirstPathPart = useRef<string | null>(null);

  useEffect(() => {
    if (firstPathPart !== previousFirstPathPart.current) {
      previousFirstPathPart.current = firstPathPart;

      if (firstPathPart === APPS.CHAT && lmnApiToken) {
        void fetchUserSchoolClasses();
        void fetchUserProjects();
      }
    }
  }, [firstPathPart, lmnApiToken]);

  useEffect(() => {
    if (!user) return;

    const userRegex = getUserRegex(user.cn);

    const getGroupsWhereUserIsMember = <T extends LmnApiProject | LmnApiSchoolClass>(groups: T[]) => {
      const isMemberGroups = groups.filter((g) => g.member.some((member) => userRegex.test(member)));
      const isAdminGroups = groups.filter((g) => g.sophomorixAdmins.includes(user.cn));
      return Array.from(new Set([...isAdminGroups, ...isMemberGroups]));
    };

    const userClasses = getGroupsWhereUserIsMember(userSchoolClasses);
    const userProjectsList = getGroupsWhereUserIsMember(userProjects);

    const classChildren: MenuItem[] = userClasses.map((cls) => ({
      id: `class-${cls.cn}`,
      label: cls.displayName || cls.cn,
      icon: faUsers,
      action: () => navigate(`/${CHAT_CLASSES_PATH}/${cls.cn}`),
      disableTranslation: true,
    }));

    const projectChildren: MenuItem[] = userProjectsList.map((proj) => ({
      id: `project-${proj.cn}`,
      label: proj.displayName || proj.cn,
      icon: faUserGear,
      action: () => navigate(`/${CHAT_PROJECTS_PATH}/${proj.cn}`),
      disableTranslation: true,
    }));

    const items: MenuItem[] = [];

    if (classChildren.length > 0) {
      items.push({
        id: 'schoolClasses',
        label: t('chat.schoolClasses'),
        icon: faUsers,
        action: () => {},
        children: classChildren,
      });
    }

    if (projectChildren.length > 0) {
      items.push({
        id: 'projects',
        label: t('chat.projects'),
        icon: faUserGear,
        action: () => {},
        children: projectChildren,
      });
    }

    setMenuItems(items);
  }, [user, userSchoolClasses, userProjects, navigate, t]);

  return {
    title: 'chat.title',
    icon: ContactIcon,
    color: 'hover:bg-primary',
    appName: APPS.CHAT,
    menuItems,
  };
};

export default useChatMenuConfig;
