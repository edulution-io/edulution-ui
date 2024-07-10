import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { APPS } from '@libs/appconfig/types';
import { MenuBarEntryProps, MenuItem } from '@/datatypes/types';
import { getFromPathName } from '@libs/common/utils';
import { USER_SETTINGS } from '@libs/userSettings/constants/user-settings-endpoints';
import ROOMBOOKING_MENUBAR_CONFIG from '@/pages/RoomBookingPage/config';
import useConferencesPageMenu from '@/pages/ConferencePage/useConferencesPageMenu';
import useAppConfigPageMenu from '@/pages/Settings/useAppConfigPageMenu';
import useUserSettingsMenuConfig from '@/pages/UserSettings/useUserSettingsMenu';
import useFileSharingMenuConfig from '@/pages/FileSharing/useMenuConfig';
import useMailPageMenu from '@/pages/Mail/useMailPageMenu';
import useLinuxmusterPageMenu from '@/pages/LinuxmusterPage/useLinuxmusterPageMenu';

const useMenuBarConfig = (): MenuBarEntryProps => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const SETTINGS_MENU_CONFIG = useAppConfigPageMenu();
  const USERSETTINGS_MENUBAR_CONFIG = useUserSettingsMenuConfig();
  const FILE_SHARING_MENUBAR_CONFIG = useFileSharingMenuConfig();
  const CONFERENCES_MENUBAR_CONFIG = useConferencesPageMenu();
  const MAIL_MENUBAR_CONFIG = useMailPageMenu();
  const LINUXMUSTER_MENUBAR_CONFIG = useLinuxmusterPageMenu();

  const menuBarConfigSwitch = (): MenuBarEntryProps => {
    const rootPathName = getFromPathName(pathname, 1);

    switch (rootPathName) {
      case 'settings':
        return SETTINGS_MENU_CONFIG;
      case USER_SETTINGS:
        return USERSETTINGS_MENUBAR_CONFIG;
      case APPS.FILE_SHARING.toString():
        return FILE_SHARING_MENUBAR_CONFIG;
      case APPS.CONFERENCES.toString():
        return CONFERENCES_MENUBAR_CONFIG;
      case APPS.ROOM_BOOKING.toString():
        return ROOMBOOKING_MENUBAR_CONFIG;
      case APPS.MAIL.toString():
        return MAIL_MENUBAR_CONFIG;
      case APPS.LINUXMUSTER.toString():
        return LINUXMUSTER_MENUBAR_CONFIG;
      default:
        return { menuItems: [], title: '', icon: '', color: '', disabled: false };
    }
  };

  const configValues = menuBarConfigSwitch();
  const menuItems: MenuItem[] = configValues.menuItems.map((item) => ({
    id: item.id,
    label: t(item.label),
    action: () => item.action(),
    icon: item.icon,
  }));

  return {
    menuItems,
    title: t(configValues.title),
    disabled: configValues.disabled,
    icon: configValues.icon,
    color: configValues.color,
  };
};

export default useMenuBarConfig;
