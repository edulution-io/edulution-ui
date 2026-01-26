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

import { useNavigate } from 'react-router-dom';
import { faInbox, faComment, faBell } from '@fortawesome/free-solid-svg-icons';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import APPS from '@libs/appconfig/constants/apps';
import NOTIFICATION_PAGE_VIEW from '@libs/notification/constants/notificationPageView';
import {
  NOTIFICATIONSCENTER_ALL_PAGE,
  NOTIFICATIONSCENTER_MESSAGES_PAGE,
  NOTIFICATIONSCENTER_SYSTEM_PAGE,
} from '@libs/notification/constants/apiEndpoints';
import { NotificationIcon } from '@/assets/icons';

const useNotificationsCenterMenuConfig = (): MenuBarEntry => {
  const navigate = useNavigate();

  return {
    title: 'notificationscenter.appTitle',
    icon: NotificationIcon,
    color: 'hover:bg-ciGreenToBlue',
    appName: APPS.NOTIFICATIONSCENTER,
    menuItems: [
      {
        id: NOTIFICATION_PAGE_VIEW.ALL,
        label: 'notificationscenter.menu.all',
        icon: faInbox,
        action: () => {
          navigate(NOTIFICATIONSCENTER_ALL_PAGE);
        },
      },
      {
        id: NOTIFICATION_PAGE_VIEW.MESSAGES,
        label: 'notificationscenter.menu.messages',
        icon: faComment,
        action: () => {
          navigate(NOTIFICATIONSCENTER_MESSAGES_PAGE);
        },
      },
      {
        id: NOTIFICATION_PAGE_VIEW.SYSTEM,
        label: 'notificationscenter.menu.system',
        icon: faBell,
        action: () => {
          navigate(NOTIFICATIONSCENTER_SYSTEM_PAGE);
        },
      },
    ],
  };
};

export default useNotificationsCenterMenuConfig;
