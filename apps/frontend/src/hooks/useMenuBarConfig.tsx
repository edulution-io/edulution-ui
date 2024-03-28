import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { MenuItem, MenuBarEntryProps, APPS } from '@/datatypes/types';
import FILESHARING_MENUBAR_CONFIG from '@/pages/FileSharing/config';
import CONFERENCES_MENUBAR_CONFIG from '@/pages/ConferencePage/config';
import ROOMBOOKING_MENUBAR_CONFIG from '@/pages/RoomBookingPage/config';
import useSettingsMenuConfig from '@/pages/Settings/config';

const useMenuBarConfig = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const SETTINGS_MENU_CONFIG = useSettingsMenuConfig();

  const menuBarConfigSwitch = () => {
    const rootPathName = `${location.pathname.split('/')[1]}`;

    if (rootPathName === 'settings') return SETTINGS_MENU_CONFIG;

    switch (rootPathName as APPS) {
      case APPS.FILE_SHARING: {
        return FILESHARING_MENUBAR_CONFIG;
      }
      case APPS.CONFERENCES: {
        return CONFERENCES_MENUBAR_CONFIG;
      }
      case APPS.ROOM_BOOKING: {
        return ROOMBOOKING_MENUBAR_CONFIG;
      }
      default: {
        return { menuItems: [], title: '', icon: '', color: '' };
      }
    }
  };

  const configValues = menuBarConfigSwitch();

  const menuItems: MenuItem[] = configValues.menuItems.map((item) => ({
    id: item.id,
    label: t(item.label),
    icon: item.icon,
    action: () => item.action(),
  }));

  const menuBarEntries: MenuBarEntryProps = {
    menuItems,
    title: t(configValues.title),
    icon: configValues.icon,
    color: configValues.color,
  };

  return menuBarEntries;
};

export default useMenuBarConfig;
