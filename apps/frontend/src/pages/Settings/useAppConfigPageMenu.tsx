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

import { AppStoreIcon, SettingsIcon } from '@/assets/icons';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import { useNavigate } from 'react-router-dom';
import useLanguage from '@/hooks/useLanguage';
import APPS from '@libs/appconfig/constants/apps';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import { APPSTORE_PATH, SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import getDisplayName from '@/utils/getDisplayName';

const useAppConfigPageMenu = () => {
  const navigate = useNavigate();
  const { appConfigs } = useAppConfigsStore();
  const { language } = useLanguage();

  const settingsMenuBarEntry: MenuBarEntry = {
    appName: APPS.SETTINGS,
    title: 'settings.title',
    icon: SettingsIcon,
    color: 'hover:bg-ciGreenToBlue',
    menuItems: [
      {
        id: APPS.APPSTORE,
        label: `${APPS.APPSTORE}.title`,
        icon: AppStoreIcon,
        action: () => navigate(APPSTORE_PATH),
      },
    ],
  };

  const appConfigPageMenu = (): MenuBarEntry => ({
    ...settingsMenuBarEntry,
    menuItems: [
      ...appConfigs.map((item) => ({
        id: item.name,
        label: getDisplayName(item, language),
        icon: item.icon,
        action: () => navigate(`/${SETTINGS_PATH}/${item.name}`),
      })),
      ...settingsMenuBarEntry.menuItems,
    ],
  });

  return appConfigPageMenu();
};

export default useAppConfigPageMenu;
