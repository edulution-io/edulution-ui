import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { APPS, MenuBarEntryProps, MenuItem } from '@/datatypes/types';
import useConferencesPageMenu from '@/pages/ConferencePage/useConferencesPageMenu';
import ROOMBOOKING_MENUBAR_CONFIG from '@/pages/RoomBookingPage/config';
import useFileSharingMenuConfig from '@/pages/FileSharing/useMenuConfig';
import useSettingsMenuConfig from '@/pages/Settings/config';
import useMailPageMenu from '@/pages/Mail/useMailPageMenu';
import { getFromPathName } from '@libs/common/utils';

const useMenuBarConfig = (): MenuBarEntryProps => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const SETTINGS_MENU_CONFIG = useSettingsMenuConfig();
  const FILE_SHARING_MENUBAR_CONFIG = useFileSharingMenuConfig();
  const CONFERENCES_MENUBAR_CONFIG = useConferencesPageMenu();
  const MAIL_MENUBAR_CONFIG = useMailPageMenu();

  const menuBarConfigSwitch = (): MenuBarEntryProps => {
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
      case APPS.MAIL: {
        return MAIL_MENUBAR_CONFIG;
      }
      default: {
        return { menuItems: [], title: '', icon: '', color: '', disabled: false };
      }
    }
  };

  const configValues = menuBarConfigSwitch();
  const menuItems: MenuItem[] = configValues.menuItems.map((item) => ({
    id: item.id,
    label: t(item.label),
    action: () => item.action(),
    icon: item.icon,
  }));

  const menuBarEntries: MenuBarEntryProps = {
    menuItems,
    title: t(configValues.title),
    disabled: configValues.disabled,
    icon: configValues.icon,
    color: configValues.color,
  };

  return menuBarEntries;
};

export default useMenuBarConfig;
