import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { MenuItem, MenuBarEntryProps, APPS } from '@/datatypes/types';
import CONFERENCES_MENUBAR_CONFIG from '@/pages/ConferencePage/config';
import ROOMBOOKING_MENUBAR_CONFIG from '@/pages/RoomBookingPage/config';
import useFileSharingMenuConfig from '@/pages/FileSharing/useMenuConfig';
import useFileManagerStore from '@/store/fileManagerStore';
import useSettingsMenuConfig from '@/pages/Settings/config';
import { getFromPathName } from '@/utils/common';

const useMenuBarConfig = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const { fetchFiles } = useFileManagerStore();
  const SETTINGS_MENU_CONFIG = useSettingsMenuConfig();
  const FILE_SHARING_MENUBAR_CONFIG = useFileSharingMenuConfig();
  const menuBarConfigSwitch = () => {
    const rootPathName = getFromPathName(pathname, 1);

    if (rootPathName === 'settings') return SETTINGS_MENU_CONFIG;

    switch (rootPathName as APPS) {
      case APPS.FILE_SHARING: {
        return FILE_SHARING_MENUBAR_CONFIG;
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
    action: () => ((pathname as APPS) === APPS.FILE_SHARING ? fetchFiles(item.label) : item.action()),
    icon: item.icon,
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
