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

import {
  LanguageIcon,
  MailIcon,
  MobileDevicesIcon,
  SecurityIcon,
  UserDetailsSettingsIcon,
  SettingsIcon,
} from '@/assets/icons';
import { useNavigate } from 'react-router-dom';
import {
  LANGUAGE_PATH,
  MAILS_PATH,
  MOBILE_ACCESS_PATH,
  SECURITY_PATH,
  USER_DETAILS_PATH,
  USER_SETTINGS_LANGUAGE_PATH,
  USER_SETTINGS_MAILS_PATH,
  USER_SETTINGS_MOBILE_ACCESS_PATH,
  USER_SETTINGS_SECURITY_PATH,
  USER_SETTINGS_USER_DETAILS_PATH,
} from '@libs/userSettings/constants/user-settings-endpoints';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import APPS from '@libs/appconfig/constants/apps';

const useUserSettingsMenu = () => {
  const navigate = useNavigate();

  const USERSETTINGS_MENUBAR_CONFIG: MenuBarEntry = {
    appName: APPS.USER_SETTINGS,
    title: 'usersettings.title',
    icon: SettingsIcon,
    color: 'hover:bg-ciGreenToBlue',
    menuItems: [
      {
        id: USER_DETAILS_PATH,
        label: 'usersettings.details.title',
        icon: UserDetailsSettingsIcon,
        action: () => navigate(USER_SETTINGS_USER_DETAILS_PATH),
      },
      {
        id: SECURITY_PATH,
        label: 'usersettings.security.title',
        icon: SecurityIcon,
        action: () => navigate(USER_SETTINGS_SECURITY_PATH),
      },
      {
        id: MAILS_PATH,
        label: 'usersettings.mails.title',
        icon: MailIcon,
        action: () => navigate(USER_SETTINGS_MAILS_PATH),
      },
      {
        id: LANGUAGE_PATH,
        label: 'usersettings.language.title',
        icon: LanguageIcon,
        action: () => navigate(USER_SETTINGS_LANGUAGE_PATH),
      },
      {
        id: MOBILE_ACCESS_PATH,
        label: 'usersettings.mobileAccess.title',
        icon: MobileDevicesIcon,
        action: () => navigate(USER_SETTINGS_MOBILE_ACCESS_PATH),
      },
    ],
  };

  return USERSETTINGS_MENUBAR_CONFIG;
};

export default useUserSettingsMenu;
