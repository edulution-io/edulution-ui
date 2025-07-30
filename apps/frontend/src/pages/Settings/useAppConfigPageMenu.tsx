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
