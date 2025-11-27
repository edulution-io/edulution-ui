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

import { useTranslation } from 'react-i18next';
import APPS from '@libs/appconfig/constants/apps';
import { SettingsIcon } from '@/assets/icons';
import useLdapGroups from '@/hooks/useLdapGroups';
import useLanguage from '@/hooks/useLanguage';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useConferenceStore from '@/pages/ConferencePage/useConferenceStore';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import getDisplayName from '@/utils/getDisplayName';
import { SidebarMenuItem } from '@libs/ui/types/sidebar';

const useSidebarItems = (): SidebarMenuItem[] => {
  const { t } = useTranslation();
  const { appConfigs } = useAppConfigsStore();
  const { isSuperAdmin } = useLdapGroups();
  const { language } = useLanguage();

  const { mails } = useMailsStore();
  const { runningConferences } = useConferenceStore();
  const { bulletinBoardNotifications } = useBulletinBoardStore();

  const getNotificationCounter = (app: string): number | undefined => {
    switch (app) {
      case APPS.MAIL:
        return mails.length;
      case APPS.CONFERENCES:
        return runningConferences.length;
      case APPS.BULLETIN_BOARD:
        return bulletinBoardNotifications.length;
      default:
        return undefined;
    }
  };

  const sidebarItems: SidebarMenuItem[] = appConfigs.map((cfg) => ({
    title: getDisplayName(cfg, language),
    link: `/${cfg.name}`,
    icon: cfg.icon,
    color: 'bg-ciGreenToBlue',
    notificationCounter: getNotificationCounter(cfg.name),
  }));

  return [
    ...sidebarItems,
    ...(isSuperAdmin
      ? [
          {
            title: t('settings.sidebar'),
            link: `/${SETTINGS_PATH}`,
            icon: SettingsIcon,
            color: 'bg-ciGreenToBlue',
          },
        ]
      : []),
  ];
};

export default useSidebarItems;
