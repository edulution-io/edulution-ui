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

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { faUsers, faUserGear } from '@fortawesome/free-solid-svg-icons';
import useLmnApiStore from '@/store/useLmnApiStore';
import { ContactIcon } from '@/assets/icons';
import MenuItem from '@libs/menubar/menuItem';
import APPS from '@libs/appconfig/constants/apps';
import { CHAT_CLASSES_PATH, CHAT_PROJECTS_PATH } from '@libs/chat/constants/chatPaths';

const useChatMenuConfig = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useLmnApiStore();

  const menuItems = useMemo<MenuItem[]>(() => {
    if (!user) return [];

    const { schoolclasses, projects } = user;
    const items: MenuItem[] = [];

    if (schoolclasses.length > 0) {
      const classChildren: MenuItem[] = schoolclasses.map((className) => ({
        id: className,
        label: className,
        icon: faUsers,
        action: () => navigate(`/${CHAT_CLASSES_PATH}/${className}`),
        disableTranslation: true,
      }));

      items.push({
        id: 'classes',
        label: t('chat.schoolClasses'),
        icon: faUsers,
        action: () => {},
        disableTranslation: true,
        children: classChildren,
      });
    }

    if (projects.length > 0) {
      const projectChildren: MenuItem[] = projects.map((projectName) => ({
        id: projectName,
        label: projectName,
        icon: faUserGear,
        action: () => navigate(`/${CHAT_PROJECTS_PATH}/${projectName}`),
        disableTranslation: true,
      }));

      items.push({
        id: 'projects',
        label: t('chat.projects'),
        icon: faUserGear,
        action: () => {},
        disableTranslation: true,
        children: projectChildren,
      });
    }

    return items;
  }, [user, navigate, t]);

  return {
    title: 'chat.title',
    icon: ContactIcon,
    color: 'hover:bg-ciGreenToBlue',
    appName: APPS.CHAT,
    menuItems,
  };
};

export default useChatMenuConfig;
