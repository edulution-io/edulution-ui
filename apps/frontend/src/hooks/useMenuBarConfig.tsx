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

import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import APPS from '@libs/appconfig/constants/apps';
import { getFromPathName } from '@libs/common/utils';
import { USER_SETTINGS_PATH } from '@libs/userSettings/constants/user-settings-endpoints';
import useAppConfigPageMenu from '@/pages/Settings/useAppConfigPageMenu';
import useUserSettingsMenuConfig from '@/pages/UserSettings/useUserSettingsMenu';
import useSurveysPageMenu from '@/pages/Surveys/useSurveysPageMenu';
import useFileSharingMenuConfig from '@/pages/FileSharing/useFileSharingMenuConfig';
import useClassManagementMenu from '@/pages/ClassManagement/useClassManagementMenu';
import type TApps from '@libs/appconfig/types/appsType';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import MenuItem from '@libs/menubar/menuItem';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import useLdapGroups from './useLdapGroups';

const useMenuBarConfig = (): MenuBarEntry => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { isSuperAdmin } = useLdapGroups();

  const SETTINGS_MENU_CONFIG = useAppConfigPageMenu();
  const USERSETTINGS_MENUBAR_CONFIG = useUserSettingsMenuConfig();
  const FILE_SHARING_MENUBAR_CONFIG = useFileSharingMenuConfig();
  const SURVEYS_MENUBAR_CONFIG = useSurveysPageMenu();
  const CLASS_MANAGEMENT_MENUBAR_CONFIG = useClassManagementMenu();

  const menuBarConfigSwitch = (): MenuBarEntry => {
    const rootPathName = getFromPathName(pathname, 1);

    if (rootPathName === SETTINGS_PATH && isSuperAdmin) return SETTINGS_MENU_CONFIG;
    if (rootPathName === USER_SETTINGS_PATH) return USERSETTINGS_MENUBAR_CONFIG;

    const defaultReturnMenuBarEntry = {
      menuItems: [],
      title: '',
      icon: '',
      color: '',
      disabled: true,
      appName: APPS.NONE,
    };

    switch (rootPathName as TApps) {
      case APPS.FILE_SHARING: {
        return FILE_SHARING_MENUBAR_CONFIG;
      }
      case APPS.SURVEYS: {
        return SURVEYS_MENUBAR_CONFIG;
      }
      case APPS.CLASS_MANAGEMENT: {
        return CLASS_MANAGEMENT_MENUBAR_CONFIG;
      }
      default: {
        return defaultReturnMenuBarEntry;
      }
    }
  };

  const configValues = menuBarConfigSwitch();
  const menuItems: MenuItem[] = configValues.menuItems.map((item) => ({
    id: item.id,
    label: item.disableTranslation ? item.label : t(item.label),
    action: () => item.action(),
    icon: item.icon,
    disableTranslation: item.disableTranslation,
  }));

  return {
    menuItems,
    title: t(configValues.title),
    disabled: configValues.disabled,
    icon: configValues.icon,
    color: configValues.color,
    appName: configValues.appName,
  };
};

export default useMenuBarConfig;
