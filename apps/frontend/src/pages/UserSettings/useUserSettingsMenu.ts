/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
        id: SECURITY_PATH,
        label: 'usersettings.security.title',
        icon: SecurityIcon,
        action: () => navigate(USER_SETTINGS_SECURITY_PATH),
      },
      {
        id: USER_DETAILS_PATH,
        label: 'usersettings.details.title',
        icon: UserDetailsSettingsIcon,
        action: () => navigate(USER_SETTINGS_USER_DETAILS_PATH),
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
